module.exports = (sequelize, DataTypes) => {
  return sequelize.define("deal_claim", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    deal_id: { type: DataTypes.STRING, allowNull: false },
    claim_source: {
      type: DataTypes.ENUM("web", "mobile", "admin"),
      allowNull: false,
      defaultValue: "web"
    },
    claimed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    coupon_code_shown: { type: DataTypes.STRING, allowNull: true },
    link_shown: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("success", "failed", "blocked_no_subscription", "blocked_plan_mismatch"),
      allowNull: false,
      defaultValue: "success"
    }
  });
};
