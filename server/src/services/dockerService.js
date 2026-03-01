const logger = require('../utils/logger');
const ProjectScaffolder = require('./projectScaffolder');
const env = require('../config/env');

class DockerService {
  constructor() {
    this.docker = null;
    this.scaffolder = new ProjectScaffolder();
    this.usedPorts = new Set();
    this.initDocker();
  }

  initDocker() {
    try {
      const Docker = require('dockerode');
      // Windows Docker Desktop uses a named pipe instead of Unix socket
      const opts = process.platform === 'win32'
        ? { socketPath: '//./pipe/docker_engine' }
        : {};
      this.docker = new Docker(opts);
      logger.info('Docker client initialized');
    } catch (error) {
      logger.warn('Docker not available:', error.message);
    }
  }

  writeDockerfile(projectDir) {
    const fs = require('fs');
    const path = require('path');
    const hasClient = fs.existsSync(path.join(projectDir, 'client', 'package.json'));

    const dockerfile = hasClient
      ? `# Stage 1: Build React frontend
FROM node:20-alpine AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2: Run Express backend + serve built frontend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
COPY --from=frontend /app/client/dist ./client/dist
EXPOSE 3000
CMD ["node", "src/index.js"]
`
      : `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/index.js"]
`;

    fs.writeFileSync(path.join(projectDir, 'Dockerfile'), dockerfile);
    logger.info(`Dockerfile written (${hasClient ? 'fullstack' : 'backend-only'})`);
  }

  get isAvailable() {
    return !!this.docker;
  }

  allocatePort() {
    for (let port = env.DEPLOY_PORT_START; port <= env.DEPLOY_PORT_END; port++) {
      if (!this.usedPorts.has(port)) {
        this.usedPorts.add(port);
        return port;
      }
    }
    throw new Error('No available ports for deployment');
  }

  releasePort(port) {
    this.usedPorts.delete(port);
  }

  async buildAndDeploy(project, generatedCode, envVars, emitEvent) {
    if (!this.isAvailable) {
      throw new Error('Docker is not available. Please install Docker to enable deployments.');
    }

    // Write project to disk
    const projectDir = await this.scaffolder.writeProjectToDisk(project._id, generatedCode.files);

    // Write Dockerfile (auto-detects fullstack vs backend-only)
    this.writeDockerfile(projectDir);

    const imageName = `erp-builder-${project._id}`.toLowerCase();

    // Build image
    emitEvent('deploy-phase', { phase: 'building', message: 'Building Docker image...' });

    const stream = await this.docker.buildImage(
      { context: projectDir, src: ['.'] },
      { t: imageName }
    );

    await new Promise((resolve, reject) => {
      this.docker.modem.followProgress(
        stream,
        (err, output) => {
          if (err) reject(err);
          else resolve(output);
        },
        (event) => {
          if (event.stream) {
            const msg = event.stream.trim();
            if (msg) emitEvent('build-log', { message: msg });
          }
          if (event.error) {
            emitEvent('build-log', { message: `ERROR: ${event.error}`, level: 'error' });
          }
        }
      );
    });

    // Create and start container
    const port = this.allocatePort();
    emitEvent('deploy-phase', { phase: 'starting', message: `Starting container on port ${port}...` });

    const containerConfig = {
      Image: imageName,
      name: `erp-${project._id}-${Date.now()}`,
      ExposedPorts: { '3000/tcp': {} },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: String(port) }]
        },
        Memory: 512 * 1024 * 1024,
        NanoCpus: 500000000,
        RestartPolicy: { Name: 'unless-stopped' }
      },
      Env: [
        'NODE_ENV=production',
        'PORT=3000',
        `MONGODB_URI=mongodb://host.docker.internal:27017/${this.toKebabCase(project.name)}`,
        ...Object.entries(envVars || {}).map(([k, v]) => `${k}=${v}`)
      ]
    };

    const container = await this.docker.createContainer(containerConfig);
    await container.start();

    emitEvent('deploy-phase', { phase: 'running', message: `Application live on port ${port}` });

    return {
      containerId: container.id,
      port,
      url: `http://localhost:${port}`
    };
  }

  async getContainerInfo(containerId) {
    if (!this.isAvailable) return null;
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      return {
        id: info.Id,
        state: info.State,
        name: info.Name,
        ports: info.NetworkSettings?.Ports
      };
    } catch (error) {
      return null;
    }
  }

  async getContainerLogs(containerId, emitEvent) {
    if (!this.isAvailable) throw new Error('Docker not available');

    const container = this.docker.getContainer(containerId);
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true
    });

    stream.on('data', (chunk) => {
      // Docker multiplexed stream - skip header bytes
      const msg = chunk.toString('utf8').replace(/^.{8}/, '').trim();
      if (msg) emitEvent('log', { message: msg });
    });

    return stream;
  }

  async stopContainer(containerId) {
    if (!this.isAvailable) throw new Error('Docker not available');
    const container = this.docker.getContainer(containerId);
    await container.stop();
    logger.info(`Container ${containerId} stopped`);
  }

  async restartContainer(containerId) {
    if (!this.isAvailable) throw new Error('Docker not available');
    const container = this.docker.getContainer(containerId);
    await container.restart();
    logger.info(`Container ${containerId} restarted`);
  }

  async removeContainer(containerId) {
    if (!this.isAvailable) throw new Error('Docker not available');
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      if (info.State.Running) {
        await container.stop();
      }
      await container.remove();
      logger.info(`Container ${containerId} removed`);
    } catch (error) {
      logger.warn(`Failed to remove container ${containerId}:`, error.message);
    }
  }

  toKebabCase(str) {
    return (str || '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
  }
}

module.exports = DockerService;
