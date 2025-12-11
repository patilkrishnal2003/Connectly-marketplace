module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("user", {
    id: { type: DataTypes.STRING, primaryKey: true }, // allow pre-defined IDs for demo
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" }
  });
};
