module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    subscriptionId: {
      type: DataTypes.UUID,
      field: 'subscription_id'
    },
    type: {
      type: DataTypes.ENUM('subscription', 'template_purchase', 'one_time'),
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currency: {
      type: DataTypes.ENUM('INR', 'USD'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('created', 'authorized', 'captured', 'failed', 'refunded'),
      defaultValue: 'created'
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(50),
      field: 'razorpay_payment_id'
    },
    razorpayOrderId: {
      type: DataTypes.STRING(50),
      field: 'razorpay_order_id'
    },
    razorpaySignature: {
      type: DataTypes.STRING(128),
      field: 'razorpay_signature'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    failureReason: {
      type: DataTypes.TEXT,
      field: 'failure_reason'
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true
  });

  return Payment;
};
