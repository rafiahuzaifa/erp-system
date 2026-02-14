module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    resourceType: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    resourceId: DataTypes.STRING(50),
    metadata: DataTypes.JSONB,
    ipAddress: DataTypes.STRING(45)
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  return AuditLog;
};
