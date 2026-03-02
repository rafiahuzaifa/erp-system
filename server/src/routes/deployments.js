const express = require('express');
const http = require('http');
const url = require('url');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');
const { authenticate } = require('../middleware/auth');
const { Deployment } = require('../models/pg');

router.use(authenticate);

router.post('/:projectId', deploymentController.deploy);
router.get('/:projectId', deploymentController.getStatus);
router.get('/:projectId/logs', deploymentController.getLogs);
router.post('/:projectId/stop', deploymentController.stop);
router.post('/:projectId/restart', deploymentController.restart);
router.delete('/:projectId', deploymentController.destroy);
router.put('/:projectId/env', deploymentController.updateEnv);

// Preview proxy — forwards requests to the running Docker container
// This avoids mixed-content / CORS issues when the ERP Builder is on HTTPS
router.use('/:projectId/preview', async (req, res) => {
  try {
    const deployment = await Deployment.findOne({
      where: { projectMongoId: req.params.projectId, status: 'running' },
      order: [['createdAt', 'DESC']]
    });

    if (!deployment || !deployment.port) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px">
          <h2>App not running</h2>
          <p>Deploy the app first to see a preview.</p>
        </body></html>
      `);
    }

    const targetPort = deployment.port;
    // Strip the /api/deployments/:projectId/preview prefix
    const pathSuffix = req.url || '/';
    const targetUrl = `http://localhost:${targetPort}${pathSuffix}`;

    const parsedTarget = url.parse(targetUrl);
    const options = {
      hostname: parsedTarget.hostname,
      port: parsedTarget.port,
      path: parsedTarget.path,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${targetPort}`,
        'x-forwarded-for': req.ip,
        'x-forwarded-proto': req.protocol
      }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      // Rewrite redirect locations to go through our proxy
      let headers = { ...proxyRes.headers };
      if (headers.location) {
        headers.location = headers.location.replace(
          `http://localhost:${targetPort}`,
          `/api/deployments/${req.params.projectId}/preview`
        );
      }
      // Remove X-Frame-Options so iframe embedding works
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.status(502).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px">
          <h2>Preview unavailable</h2>
          <p>The app container is not responding. Try restarting it.</p>
          <small>${err.message}</small>
        </body></html>
      `);
    });

    if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
      proxyReq.write(JSON.stringify(req.body));
    }

    proxyReq.end();
  } catch (err) {
    res.status(500).send('Preview proxy error: ' + err.message);
  }
});

module.exports = router;
