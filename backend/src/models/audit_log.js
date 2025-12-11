module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("audit_log", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    deal_id: { type: DataTypes.STRING, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true }
  });
};
