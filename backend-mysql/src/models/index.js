const { Sequelize } = require("sequelize");
const UserModel = require("./user");
const ServiceModel = require("./service");
const DealModel = require("./deal");
const UnlockModel = require("./unlock");
const PurchaseModel = require("./purchase");
const AuditLogModel = require("./audit_log");
const dotenv = require("dotenv");
dotenv.config();

// Create Sequelize with robust connection options
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: "mysql",
  logging: false, // set to console.log if you need SQL debug
  dialectOptions: {
    // increase connect timeout; enable ssl config here if your host requires it
    connectTimeout: 20000
    // ssl: { rejectUnauthorized: true } 
  },
  pool: {
    max: 5,       // keep small for shared hosts
    min: 0,
    acquire: 60000,
    idle: 20000
  },
  define: {
    underscored: true,
    timestamps: true
  }
});

const User = UserModel(sequelize);
const Service = ServiceModel(sequelize);
const Deal = DealModel(sequelize);
const Unlock = UnlockModel(sequelize);
const Purchase = PurchaseModel(sequelize);
const AuditLog = AuditLogModel(sequelize);

// Relationships
const ServiceDeal = sequelize.define("service_deal", {}, { timestamps: false });

Service.belongsToMany(Deal, { through: ServiceDeal, foreignKey: "service_id" });
Deal.belongsToMany(Service, { through: ServiceDeal, foreignKey: "deal_id" });

User.hasMany(Purchase, { foreignKey: "user_id" });
Purchase.belongsTo(User, { foreignKey: "user_id" });
AuditLog.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Unlock, { foreignKey: "user_id" });
Unlock.belongsTo(User, { foreignKey: "user_id" });

Deal.hasMany(Unlock, { foreignKey: "deal_id" });
Unlock.belongsTo(Deal, { foreignKey: "deal_id" });

Deal.hasMany(AuditLog, { foreignKey: "deal_id" });
AuditLog.belongsTo(Deal, { foreignKey: "deal_id" });

module.exports = {
  sequelize,
  User,
  Service,
  Deal,
  Unlock,
  Purchase,
  AuditLog,
  ServiceDeal
};
