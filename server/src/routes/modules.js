const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticate } = require('../middleware/auth');

// Catalog is public
router.get('/catalog', moduleController.getCatalog);

// All other routes require auth
router.use(authenticate);
router.get('/:projectId', moduleController.getProjectModules);
router.put('/:projectId', moduleController.updateModules);
router.post('/:projectId/entity', moduleController.addEntity);
router.put('/:projectId/entity/:entityId', moduleController.updateEntity);
router.delete('/:projectId/entity/:entityId', moduleController.removeEntity);
router.post('/:projectId/relationship', moduleController.addRelationship);
router.delete('/:projectId/relationship/:relId', moduleController.removeRelationship);
router.post('/:projectId/ai-enhance', moduleController.aiEnhance);

module.exports = router;
