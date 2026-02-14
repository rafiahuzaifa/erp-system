const Project = require('../models/mongo/Project');
const GeneratedCode = require('../models/mongo/GeneratedCode');
const { Deployment } = require('../models/pg');
const DockerService = require('../services/dockerService');
const PM2Service = require('../services/pm2Service');
const logger = require('../utils/logger');

const dockerService = new DockerService();
const pm2Service = new PM2Service();

const getDeployService = () => {
  if (dockerService.isAvailable) return { service: dockerService, type: 'docker' };
  return { service: pm2Service, type: 'pm2' };
};

exports.deploy = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const generatedCode = await GeneratedCode.findOne({
      projectId: project._id,
      status: 'complete'
    }).sort({ version: -1 });

    if (!generatedCode) {
      return res.status(400).json({ error: 'Generate code before deploying' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const emitEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const { service, type } = getDeployService();

    const deployment = await Deployment.create({
      projectMongoId: project._id.toString(),
      userId: req.user?.id || '00000000-0000-0000-0000-000000000000',
      status: 'building',
      envVars: req.body.envVars || {}
    });

    await Project.findByIdAndUpdate(project._id, { $set: { status: 'deploying' } });

    try {
      emitEvent('status', { status: 'building', message: `Deploying via ${type}...`, deployType: type });

      const result = await service.buildAndDeploy(
        project, generatedCode, deployment.envVars, emitEvent
      );

      await deployment.update({
        status: 'running',
        containerId: result.containerId,
        port: result.port,
        deployedAt: new Date(),
        healthCheckUrl: `http://localhost:${result.port}/api/health`
      });

      await Project.findByIdAndUpdate(project._id, { $set: { status: 'deployed' } });

      emitEvent('complete', {
        status: 'running',
        port: result.port,
        url: result.url,
        containerId: result.containerId,
        deployType: type
      });
    } catch (deployError) {
      logger.error('Deployment failed:', deployError);
      await deployment.update({ status: 'failed', errorMessage: deployError.message });
      await Project.findByIdAndUpdate(project._id, { $set: { status: 'failed' } });
      emitEvent('error', { message: deployError.message });
    }

    res.end();
  } catch (error) {
    next(error);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const deployment = await Deployment.findOne({
      where: { projectMongoId: req.params.projectId },
      order: [['createdAt', 'DESC']]
    });

    if (!deployment) return res.status(404).json({ error: 'No deployment found' });

    let processInfo = null;
    if (deployment.containerId) {
      if (deployment.containerId.startsWith('pid-')) {
        processInfo = await pm2Service.getProcessInfo(req.params.projectId);
      } else {
        processInfo = await dockerService.getContainerInfo(deployment.containerId);
      }
    }

    res.json({ deployment, container: processInfo });
  } catch (error) {
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const deployment = await Deployment.findOne({
      where: { projectMongoId: req.params.projectId },
      order: [['createdAt', 'DESC']]
    });

    if (!deployment || !deployment.containerId) {
      return res.status(404).json({ error: 'No running deployment found' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const emitEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    let stream;
    if (deployment.containerId.startsWith('pid-')) {
      stream = await pm2Service.getProcessLogs(req.params.projectId, emitEvent);
    } else {
      stream = await dockerService.getContainerLogs(deployment.containerId, emitEvent);
    }

    req.on('close', () => {
      if (stream && stream.destroy) stream.destroy();
    });
  } catch (error) {
    next(error);
  }
};

exports.stop = async (req, res, next) => {
  try {
    const deployment = await Deployment.findOne({
      where: { projectMongoId: req.params.projectId, status: 'running' },
      order: [['createdAt', 'DESC']]
    });

    if (!deployment) return res.status(404).json({ error: 'No running deployment found' });

    if (deployment.containerId.startsWith('pid-')) {
      await pm2Service.stopProcess(req.params.projectId);
    } else {
      await dockerService.stopContainer(deployment.containerId);
    }

    await deployment.update({ status: 'stopped', stoppedAt: new Date() });

    await Project.findByIdAndUpdate(req.params.projectId, { $set: { status: 'generated' } });

    res.json({ message: 'Deployment stopped', deployment });
  } catch (error) {
    next(error);
  }
};

exports.restart = async (req, res, next) => {
  try {
    const deployment = await Deployment.findOne({
      where: { projectMongoId: req.params.projectId },
      order: [['createdAt', 'DESC']]
    });

    if (!deployment || !deployment.containerId) {
      return res.status(404).json({ error: 'No deployment found' });
    }

    if (deployment.containerId.startsWith('pid-')) {
      await pm2Service.restartProcess(req.params.projectId);
    } else {
      await dockerService.restartContainer(deployment.containerId);
    }

    await deployment.update({ status: 'running', deployedAt: new Date() });
    res.json({ message: 'Deployment restarted', deployment });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const deployment = await Deployment.findOne({
      where: { projectMongoId: req.params.projectId },
      order: [['createdAt', 'DESC']]
    });

    if (!deployment) return res.status(404).json({ error: 'No deployment found' });

    if (deployment.containerId) {
      if (deployment.containerId.startsWith('pid-')) {
        await pm2Service.removeProcess(req.params.projectId);
      } else {
        await dockerService.removeContainer(deployment.containerId);
      }
    }

    await deployment.update({ status: 'destroyed' });
    res.json({ message: 'Deployment destroyed' });
  } catch (error) {
    next(error);
  }
};

exports.updateEnv = async (req, res, next) => {
  try {
    const { envVars } = req.body;
    const deployment = await Deployment.findOne({
      where: { projectMongoId: req.params.projectId },
      order: [['createdAt', 'DESC']]
    });

    if (!deployment) return res.status(404).json({ error: 'No deployment found' });

    await deployment.update({ envVars });
    res.json({ message: 'Environment variables updated. Restart to apply.', deployment });
  } catch (error) {
    next(error);
  }
};
