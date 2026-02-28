const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const ProjectScaffolder = require('./projectScaffolder');
const env = require('../config/env');

class PM2Service {
  constructor() {
    this.scaffolder = new ProjectScaffolder();
    this.usedPorts = new Set();
    this.processes = new Map(); // projectId -> { port, pid, status }
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

  toKebabCase(str) {
    return (str || '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
  }

  runCommand(cmd, cwd, envOverrides, emitEvent) {
    return new Promise((resolve, reject) => {
      const proc = exec(cmd, { cwd, env: { ...process.env, ...envOverrides }, timeout: 300000 });
      proc.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) emitEvent('build-log', { message: msg });
      });
      proc.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.startsWith('npm warn') && !msg.startsWith('npm notice')) {
          emitEvent('build-log', { message: msg });
        }
      });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`"${cmd}" failed with exit code ${code}`));
      });
      proc.on('error', reject);
    });
  }

  async buildAndDeploy(project, generatedCode, envVars, emitEvent) {
    const projectDir = await this.scaffolder.writeProjectToDisk(project._id, generatedCode.files);
    const processName = `erp-${this.toKebabCase(project.name)}-${project._id.toString().slice(-6)}`;
    const clientDir = path.join(projectDir, 'client');
    const hasClient = fs.existsSync(path.join(clientDir, 'package.json'));

    // Phase 1: Install backend dependencies
    emitEvent('deploy-phase', { phase: 'installing', message: 'Installing backend dependencies...' });
    await this.runCommand('npm install --production', projectDir, { NODE_ENV: 'production' }, emitEvent);

    // Phase 2 (optional): Build React frontend
    if (hasClient) {
      emitEvent('deploy-phase', { phase: 'frontend-install', message: 'Installing frontend dependencies...' });
      await this.runCommand('npm install', clientDir, {}, emitEvent);

      emitEvent('deploy-phase', { phase: 'frontend-build', message: 'Building React frontend (this may take a minute)...' });
      await this.runCommand('npm run build', clientDir, { NODE_ENV: 'production' }, emitEvent);
      emitEvent('build-log', { message: '✓ Frontend build complete' });
    }

    // Phase 3: Start the process
    const port = this.allocatePort();
    emitEvent('deploy-phase', { phase: 'starting', message: `Starting application on port ${port}...` });

    const mongoDbName = this.toKebabCase(project.name);
    const processEnv = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      MONGODB_URI: `mongodb://localhost:27017/${mongoDbName}`,
      ...envVars
    };

    const entryFile = fs.existsSync(path.join(projectDir, 'src', 'index.js'))
      ? path.join(projectDir, 'src', 'index.js')
      : path.join(projectDir, 'index.js');

    return new Promise((resolve, reject) => {
      const child = spawn('node', [entryFile], {
        cwd: projectDir,
        env: processEnv,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let started = false;
      const logFile = path.join(projectDir, 'app.log');
      const logStream = fs.createWriteStream(logFile, { flags: 'a' });

      child.stdout.pipe(logStream);
      child.stderr.pipe(logStream);

      child.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) emitEvent('build-log', { message: msg });
        if (!started && (msg.includes('listening') || msg.includes('running') || msg.includes('started') || msg.includes('port'))) {
          started = true;
        }
      });

      child.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) emitEvent('build-log', { message: `[stderr] ${msg}`, level: 'warn' });
      });

      child.on('error', (err) => {
        this.releasePort(port);
        reject(new Error(`Failed to start process: ${err.message}`));
      });

      child.unref();

      // Store process info
      this.processes.set(project._id.toString(), {
        pid: child.pid,
        port,
        processName,
        projectDir,
        logFile,
        child
      });

      // Wait a moment and check if the process is still running
      setTimeout(() => {
        try {
          process.kill(child.pid, 0); // Check if alive
          emitEvent('deploy-phase', { phase: 'running', message: `Application live on port ${port}` });
          resolve({
            containerId: `pid-${child.pid}`,
            port,
            url: `http://localhost:${port}`
          });
        } catch {
          this.releasePort(port);
          reject(new Error('Process exited unexpectedly after starting'));
        }
      }, 3000);
    });
  }

  async getProcessInfo(projectId) {
    const info = this.processes.get(projectId.toString());
    if (!info) return null;

    try {
      process.kill(info.pid, 0);
      return {
        id: `pid-${info.pid}`,
        state: { Status: 'running', Running: true },
        name: info.processName,
        port: info.port
      };
    } catch {
      return {
        id: `pid-${info.pid}`,
        state: { Status: 'stopped', Running: false },
        name: info.processName,
        port: info.port
      };
    }
  }

  async getProcessLogs(projectId, emitEvent) {
    const info = this.processes.get(projectId.toString());
    if (!info) throw new Error('No process found for this project');

    const logFile = info.logFile;
    if (!fs.existsSync(logFile)) {
      emitEvent('log', { message: 'No logs available yet.' });
      return null;
    }

    // Read existing logs
    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.split('\n').slice(-100);
    lines.forEach(line => {
      if (line.trim()) emitEvent('log', { message: line });
    });

    // Watch for new logs
    const watcher = fs.watch(logFile, () => {
      try {
        const newContent = fs.readFileSync(logFile, 'utf-8');
        const newLines = newContent.split('\n').slice(-5);
        newLines.forEach(line => {
          if (line.trim()) emitEvent('log', { message: line });
        });
      } catch {}
    });

    return { destroy: () => watcher.close() };
  }

  async stopProcess(projectId) {
    const info = this.processes.get(projectId.toString());
    if (!info) throw new Error('No process found');

    try {
      process.kill(info.pid, 'SIGTERM');
      logger.info(`Process ${info.pid} stopped for project ${projectId}`);
    } catch (err) {
      logger.warn(`Process ${info.pid} already stopped:`, err.message);
    }
  }

  async restartProcess(projectId) {
    const info = this.processes.get(projectId.toString());
    if (!info) throw new Error('No process found');

    // Stop old process
    try { process.kill(info.pid, 'SIGTERM'); } catch {}

    // Wait a moment then restart
    await new Promise(r => setTimeout(r, 1000));

    const entryFile = fs.existsSync(path.join(info.projectDir, 'src', 'index.js'))
      ? path.join(info.projectDir, 'src', 'index.js')
      : path.join(info.projectDir, 'index.js');

    const child = spawn('node', [entryFile], {
      cwd: info.projectDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(info.port),
        MONGODB_URI: `mongodb://localhost:27017/${info.processName}`
      },
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const logStream = fs.createWriteStream(info.logFile, { flags: 'a' });
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);
    child.unref();

    info.pid = child.pid;
    info.child = child;

    logger.info(`Process restarted: PID ${child.pid} on port ${info.port}`);
  }

  async removeProcess(projectId) {
    const info = this.processes.get(projectId.toString());
    if (!info) return;

    try { process.kill(info.pid, 'SIGTERM'); } catch {}
    this.releasePort(info.port);
    this.processes.delete(projectId.toString());

    logger.info(`Process removed for project ${projectId}`);
  }
}

module.exports = PM2Service;
