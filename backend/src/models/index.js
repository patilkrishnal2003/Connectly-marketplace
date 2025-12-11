const { Sequelize } = require("sequelize");
const UserModel = require("./user");
const ServiceModel = require("./service");
const DealModel = require("./deal");
const UnlockModel = require("./unlock");
const PurchaseModel = require("./purchase");
const AuditLogModel = require("./audit_log");
const dotenv = require("dotenv");
dotenv.config();

// Improved connection options: larger pool, connectTimeout, and optional SSL.
// If your host requires SSL/TLS, keep 'ssl: { rejectUnauthorized: false }'.
// For higher security, configure proper CA certs instead of rejectUnauthorized=false.
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    // allow insecure fallback for shared hosts that use TLS but don't provide CA chain.
    ssl: process.env.DB_REQUIRE_SSL === "true" ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
    connectTimeout: 20000, // 20s
  },
  define: {
    underscored: true,
    timestamps: true
  },
  pool: {
    max: 15,
    min: 0,
    acquire: 60000, // how long to try getting connection before throwing (ms)
    idle: 30000,
    evict: 10000
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
Service.hasMany(Purchase, { foreignKey: "service_id" });
Purchase.belongsTo(Service, { foreignKey: "service_id" });

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
