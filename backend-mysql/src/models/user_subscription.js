module.exports = (sequelize, DataTypes) => {
  return sequelize.define("user_subscription", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    plan_id: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("active", "expired", "canceled", "pending"),
      allowNull: false,
      defaultValue: "active"
    },
    started_at: { type: DataTypes.DATE, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    renewed_at: { type: DataTypes.DATE, allowNull: true },
    source: {
      type: DataTypes.ENUM("manual", "online_purchase", "admin_grant"),
      allowNull: false,
      defaultValue: "online_purchase"
    }
  });
};
