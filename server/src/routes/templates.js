const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { enforceProjectLimit } = require('../middleware/planLimits');

router.get('/', optionalAuth, templateController.list);
router.get('/:slug', optionalAuth, templateController.getBySlug);
router.post('/:slug/use', authenticate, enforceProjectLimit, templateController.useTemplate);

module.exports = router;
