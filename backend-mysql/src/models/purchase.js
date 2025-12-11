module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("purchase", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    service_id: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "completed" },
    provider: { type: DataTypes.STRING, allowNull: true },
    provider_payment_id: { type: DataTypes.STRING, allowNull: true }
  });
};
