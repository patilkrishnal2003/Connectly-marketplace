module.exports = (sequelize, DataTypes) => {
  return sequelize.define("user_deal_exception", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    deal_id: { type: DataTypes.STRING, allowNull: false },
    source_note: { type: DataTypes.TEXT, allowNull: true },
    valid_from: { type: DataTypes.DATE, allowNull: true },
    valid_to: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_by_admin_id: { type: DataTypes.STRING, allowNull: true }
  });
};
