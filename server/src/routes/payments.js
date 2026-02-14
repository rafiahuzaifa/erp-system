const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create-order', authenticate, paymentController.createOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.post('/webhook', paymentController.webhook);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/subscription', authenticate, paymentController.getCurrentSubscription);
router.post('/cancel', authenticate, paymentController.cancelSubscription);

module.exports = router;
