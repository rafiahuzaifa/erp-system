module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
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
    plan: {
      type: DataTypes.ENUM('free', 'pro', 'enterprise'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'past_due', 'expired'),
      defaultValue: 'active'
    },
    currency: {
      type: DataTypes.ENUM('INR', 'USD'),
      allowNull: false,
      defaultValue: 'INR'
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    razorpaySubscriptionId: {
      type: DataTypes.STRING(50),
      unique: true,
      field: 'razorpay_subscription_id'
    },
    razorpayPlanId: {
      type: DataTypes.STRING(50),
      field: 'razorpay_plan_id'
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      field: 'current_period_start'
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      field: 'current_period_end'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      field: 'cancelled_at'
    }
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true
  });

  return Subscription;
};
