const express = require('express');
const router = express.Router();
const codegenController = require('../controllers/codegenController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/:projectId/generate', codegenController.generate);
router.get('/:projectId/status', codegenController.getStatus);
router.get('/:projectId/download', codegenController.download);
router.get('/:projectId/files', codegenController.listFiles);
router.get('/:projectId/files/*', codegenController.getFile);
router.post('/:projectId/regenerate', codegenController.regenerate);

module.exports = router;
