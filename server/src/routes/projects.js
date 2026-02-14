const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { validate, schemas } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const { enforceProjectLimit } = require('../middleware/planLimits');

router.use(authenticate);

router.get('/', projectController.list);
router.post('/', validate(schemas.createProject), enforceProjectLimit, projectController.create);
router.get('/:id', projectController.getById);
router.put('/:id', validate(schemas.updateProject), projectController.update);
router.delete('/:id', projectController.remove);
router.get('/:id/export', projectController.exportZip);

module.exports = router;
