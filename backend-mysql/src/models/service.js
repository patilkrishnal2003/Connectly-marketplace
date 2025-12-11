module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("service", {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    code: { type: DataTypes.STRING, allowNull: true, unique: true },
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
