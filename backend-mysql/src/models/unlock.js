module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  return sequelize.define("unlock", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    deal_id: { type: DataTypes.STRING, allowNull: false },
    source: { type: DataTypes.STRING } // purchase/manual/webhook
  });
};
