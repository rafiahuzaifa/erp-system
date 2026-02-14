module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'developer', 'viewer'),
      defaultValue: 'developer'
    },
    plan: {
      type: DataTypes.ENUM('free', 'pro', 'enterprise'),
      defaultValue: 'free'
    },
    projectQuota: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    lastLoginAt: DataTypes.DATE
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  return User;
};
