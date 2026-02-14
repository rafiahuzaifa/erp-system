const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/:projectId', deploymentController.deploy);
router.get('/:projectId', deploymentController.getStatus);
router.get('/:projectId/logs', deploymentController.getLogs);
router.post('/:projectId/stop', deploymentController.stop);
router.post('/:projectId/restart', deploymentController.restart);
router.delete('/:projectId', deploymentController.destroy);
router.put('/:projectId/env', deploymentController.updateEnv);

module.exports = router;
