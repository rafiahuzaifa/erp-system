const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UserModel = require('./User');
const DeploymentModel = require('./Deployment');
const AuditLogModel = require('./AuditLog');
const SubscriptionModel = require('./Subscription');
const PaymentModel = require('./Payment');

const User = UserModel(sequelize, DataTypes);
const Deployment = DeploymentModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);
const Subscription = SubscriptionModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);

// Associations
User.hasMany(Deployment, { foreignKey: 'userId' });
Deployment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

Subscription.hasMany(Payment, { foreignKey: 'subscriptionId' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId' });

module.exports = { User, Deployment, AuditLog, Subscription, Payment, sequelize };
