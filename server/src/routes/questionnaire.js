const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/:projectId', questionnaireController.get);
router.put('/:projectId/step/:stepNum', questionnaireController.saveStep);
router.post('/:projectId/ai-suggest', questionnaireController.aiSuggest);
router.post('/:projectId/complete', questionnaireController.complete);

module.exports = router;
