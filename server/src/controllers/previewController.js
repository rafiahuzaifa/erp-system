const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Project = require('../models/mongo/Project');
const GeneratedCode = require('../models/mongo/GeneratedCode');
const ProjectScaffolder = require('../services/projectScaffolder');
const env = require('../config/env');
const logger = require('../utils/logger');

const scaffolder = new ProjectScaffolder();

// In-memory map of projectId → built preview dir
const previewDirs = new Map();

// POST /api/preview/:projectId — build frontend and stream SSE progress
exports.buildPreview = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const generatedCode = await GeneratedCode.findOne({
      projectId: project._id,
      status: 'complete'
    }).sort({ version: -1 });

    if (!generatedCode) {
      return res.status(400).json({ error: 'Generate code first before previewing' });
    }

    // Start SSE stream
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const emit = (event, data) => {
      try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch {}
    };

    try {
      emit('status', { message: 'Writing project files to disk...' });

      // Write all project files
      const projectDir = await scaffolder.writeProjectToDisk(projectId, generatedCode.files);
      const clientDir = path.join(projectDir, 'client');

      if (!fs.existsSync(clientDir)) {
        emit('error', { message: 'No client (frontend) found in generated project.' });
        return res.end();
      }

      emit('status', { message: 'Installing frontend dependencies...' });

      // Run npm install in client dir
      await runCommand('npm', ['install', '--prefer-offline'], clientDir, emit);

      emit('status', { message: 'Building frontend...' });

      // Run vite build
      await runCommand('npm', ['run', 'build'], clientDir, emit);

      const distDir = path.join(clientDir, 'dist');
      if (!fs.existsSync(distDir)) {
        emit('error', { message: 'Build failed — dist folder not created.' });
        return res.end();
      }

      previewDirs.set(projectId, distDir);
      logger.info(`Preview built for ${projectId} → ${distDir}`);

      emit('complete', { message: 'Preview ready!', projectId });
    } catch (buildErr) {
      logger.error('Preview build failed:', buildErr.message);
      emit('error', { message: buildErr.message });
    }

    res.end();
  } catch (error) {
    next(error);
  }
};

// GET /api/preview/:projectId/* — serve built static files
exports.servePreview = (req, res) => {
  const { projectId } = req.params;
  const distDir = previewDirs.get(projectId);

  if (!distDir || !fs.existsSync(distDir)) {
    return res.status(404).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>Preview not built yet</h2>
        <p>Click "Build Preview" to generate the UI preview.</p>
      </body></html>
    `);
  }

  // Serve requested file or fall back to index.html (SPA routing)
  let filePath = req.params[0] || 'index.html';
  if (filePath === '' || filePath === '/') filePath = 'index.html';

  const fullPath = path.join(distDir, filePath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return res.sendFile(fullPath);
  }

  // SPA fallback → index.html
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.status(404).send('File not found');
};

// Helper: spawn a command and emit stdout/stderr as SSE build-log events
function runCommand(cmd, args, cwd, emit) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const proc = spawn(isWin ? `${cmd}.cmd` : cmd, args, {
      cwd,
      shell: isWin,
      env: { ...process.env, CI: 'true', FORCE_COLOR: '0' }
    });

    proc.stdout.on('data', (d) => {
      const line = d.toString().trim();
      if (line) emit('build-log', { message: line });
    });

    proc.stderr.on('data', (d) => {
      const line = d.toString().trim();
      if (line) emit('build-log', { message: line });
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });

    proc.on('error', reject);
  });
}
