const Razorpay = require('razorpay');
const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance && env.RAZORPAY_KEY_ID) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

const createOrder = async ({ amount, currency, receipt, notes }) => {
  const razorpay = getRazorpay();
  if (!razorpay) throw new Error('Razorpay not configured');

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes: notes || {}
  });
  logger.info(`Razorpay order created: ${order.id}`);
  return order;
};

const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

const verifyWebhookSignature = (body, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

const fetchPayment = async (paymentId) => {
  const razorpay = getRazorpay();
  if (!razorpay) throw new Error('Razorpay not configured');
  return razorpay.payments.fetch(paymentId);
};

const cancelSubscription = async (subscriptionId) => {
  const razorpay = getRazorpay();
  if (!razorpay) throw new Error('Razorpay not configured');
  return razorpay.subscriptions.cancel(subscriptionId);
};

module.exports = {
  getRazorpay,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayment,
  cancelSubscription
};
