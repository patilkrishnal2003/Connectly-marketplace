module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("service", {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
  });
};
