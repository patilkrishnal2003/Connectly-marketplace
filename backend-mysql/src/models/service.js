module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("service", {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: true }, // optional code/tier slug (e.g. standard, professional)
    tier: { type: DataTypes.STRING, allowNull: true }, // normalized tier for access control
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    description: { type: DataTypes.TEXT, allowNull: true },
    price_cents: { type: DataTypes.INTEGER, allowNull: true },
    billing_interval: {
      type: DataTypes.ENUM("monthly", "yearly"),
      allowNull: false,
      defaultValue: "monthly"
    },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  });
};
