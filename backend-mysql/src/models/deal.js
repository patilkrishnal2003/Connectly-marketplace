module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("deal", {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    partner: { type: DataTypes.STRING, allowNull: true },
    logo: { type: DataTypes.STRING, allowNull: true, field: "Logo" },
    value: { type: DataTypes.STRING, allowNull: true, field: "deal_value" },
    type: { type: DataTypes.STRING, allowNull: true }, // coupon/link
    coupon_code: { type: DataTypes.STRING, allowNull: true }, // store real coupon (be careful)
    link: { type: DataTypes.STRING, allowNull: true },
    locked_by_default: { type: DataTypes.BOOLEAN, defaultValue: true },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    tier: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "standard"
    },
    rating: { type: DataTypes.DECIMAL(3, 1), allowNull: true, field: "Rating" }
  });
};
