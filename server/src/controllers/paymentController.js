const { User, Subscription, Payment } = require('../models/pg');
const razorpayService = require('../services/razorpayService');
const { PLANS } = require('../../../shared');
const logger = require('../utils/logger');

exports.createOrder = async (req, res, next) => {
  try {
    const { planId, currency = 'INR' } = req.body;
    const plan = PLANS[planId];

    if (!plan || !plan.pricing[currency]) {
      return res.status(400).json({ error: 'Invalid plan or currency' });
    }

    if (plan.pricing[currency] === 0) {
      return res.status(400).json({ error: 'Cannot create order for free plan' });
    }

    const order = await razorpayService.createOrder({
      amount: plan.pricing[currency],
      currency,
      receipt: `sub_${req.user.id}_${Date.now()}`,
      notes: { userId: req.user.id, plan: planId }
    });

    await Payment.create({
      userId: req.user.id,
      type: 'subscription',
      amount: plan.pricing[currency],
      currency,
      status: 'created',
      razorpayOrderId: order.id,
      metadata: { planId }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    const isValid = razorpayService.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const payment = await Payment.findOne({ where: { razorpayOrderId: razorpay_order_id } });
    if (payment) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'captured';
      await payment.save();
    }

    const plan = PLANS[planId];
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.create({
      userId: req.user.id,
      plan: planId,
      status: 'active',
      currency: payment?.currency || 'INR',
      amount: plan.pricing[payment?.currency || 'INR'],
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd
    });

    if (payment) {
      payment.subscriptionId = subscription.id;
      await payment.save();
    }

    const user = await User.findByPk(req.user.id);
    user.plan = planId;
    user.projectQuota = plan.projectLimit === -1 ? 999 : plan.projectLimit;
    await user.save();

    logger.info(`User ${req.user.id} upgraded to ${planId}`);

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan }
    });
  } catch (error) {
    next(error);
  }
};

exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (!razorpayService.verifyWebhookSignature(body, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event || JSON.parse(body).event;
    logger.info(`Razorpay webhook: ${event}`);

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

exports.getCurrentSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' },
      order: [['createdAt', 'DESC']]
    });
    res.json(subscription || { plan: 'free', status: 'active' });
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    if (subscription.razorpaySubscriptionId) {
      await razorpayService.cancelSubscription(subscription.razorpaySubscriptionId);
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    const user = await User.findByPk(req.user.id);
    user.plan = 'free';
    user.projectQuota = 1;
    await user.save();

    res.json({ message: 'Subscription cancelled', user: { plan: user.plan } });
  } catch (error) {
    next(error);
  }
};
