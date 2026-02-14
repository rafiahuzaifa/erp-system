module.exports = (sequelize, DataTypes) => {
  const Deployment = sequelize.define('Deployment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectMongoId: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    status: {
      type: DataTypes.ENUM('pending', 'building', 'running', 'stopped', 'failed', 'destroyed'),
      defaultValue: 'pending'
    },
    containerId: DataTypes.STRING(64),
    imageId: DataTypes.STRING(64),
    port: DataTypes.INTEGER,
    internalPort: {
      type: DataTypes.INTEGER,
      defaultValue: 3000
    },
    envVars: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    resourceLimits: {
      type: DataTypes.JSONB,
      defaultValue: { memory: '512m', cpus: '0.5' }
    },
    healthCheckUrl: DataTypes.STRING,
    lastHealthCheck: DataTypes.DATE,
    buildLog: DataTypes.TEXT,
    errorMessage: DataTypes.TEXT,
    deployedAt: DataTypes.DATE,
    stoppedAt: DataTypes.DATE
  }, {
    tableName: 'deployments',
    timestamps: true,
    underscored: true
  });

  return Deployment;
};
