const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./user");
const ServiceModel = require("./service");
const DealModel = require("./deal");
const UnlockModel = require("./unlock");
const PurchaseModel = require("./purchase");
const AuditLogModel = require("./audit_log");
const UserSubscriptionModel = require("./user_subscription");
const DealClaimModel = require("./deal_claim");
const UserDealExceptionModel = require("./user_deal_exception");
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
const UserSubscription = UserSubscriptionModel(sequelize, DataTypes);
const DealClaim = DealClaimModel(sequelize, DataTypes);
const UserDealException = UserDealExceptionModel(sequelize, DataTypes);

// ============================================================================
// RELATIONSHIPS - Optimized to prevent duplicate indexes
// ============================================================================
// Key principle: Define belongsTo (creates FK) and hasMany (for queries) separately
// Use constraints: false on hasMany to prevent duplicate index creation
// ============================================================================

// Service <-> Deal (Many-to-Many through junction table)
const ServiceDeal = sequelize.define("service_deal", {}, { timestamps: false });

Service.belongsToMany(Deal, { 
  through: ServiceDeal, 
  foreignKey: "service_id",
  otherKey: "deal_id"
});
Deal.belongsToMany(Service, { 
  through: ServiceDeal, 
  foreignKey: "deal_id",
  otherKey: "service_id"
});

// Purchase -> User (Many-to-One)
Purchase.belongsTo(User, { 
  foreignKey: "user_id",
  targetKey: "id"
});
// User -> Purchase (One-to-Many, for queries only, no duplicate FK)
User.hasMany(Purchase, { 
  foreignKey: "user_id",
  sourceKey: "id",
  constraints: false  // Prevents duplicate index since belongsTo already creates it
});

// AuditLog -> User (Many-to-One)
AuditLog.belongsTo(User, { 
  foreignKey: "user_id",
  targetKey: "id"
});
// User -> AuditLog (One-to-Many, for queries only)
User.hasMany(AuditLog, { 
  foreignKey: "user_id",
  sourceKey: "id",
  constraints: false
});

// AuditLog -> Deal (Many-to-One)
AuditLog.belongsTo(Deal, { 
  foreignKey: "deal_id",
  targetKey: "id"
});
// Deal -> AuditLog (One-to-Many, for queries only)
Deal.hasMany(AuditLog, { 
  foreignKey: "deal_id",
  sourceKey: "id",
  constraints: false
});

// UserSubscription -> User (Many-to-One)
UserSubscription.belongsTo(User, { 
  foreignKey: "user_id",
  targetKey: "id"
});
// User -> UserSubscription (One-to-Many, for queries only)
User.hasMany(UserSubscription, { 
  foreignKey: "user_id",
  sourceKey: "id",
  constraints: false
});

// UserSubscription -> Service (Many-to-One)
UserSubscription.belongsTo(Service, { 
  foreignKey: "plan_id",
  targetKey: "id"
});
// Service -> UserSubscription (One-to-Many, for queries only)
Service.hasMany(UserSubscription, { 
  foreignKey: "plan_id",
  sourceKey: "id",
  constraints: false
});

// Unlock -> User (Many-to-One)
Unlock.belongsTo(User, { 
  foreignKey: "user_id",
  targetKey: "id"
});
// User -> Unlock (One-to-Many, for queries only)
User.hasMany(Unlock, { 
  foreignKey: "user_id",
  sourceKey: "id",
  constraints: false
});

// Unlock -> Deal (Many-to-One)
Unlock.belongsTo(Deal, { 
  foreignKey: "deal_id",
  targetKey: "id"
});
// Deal -> Unlock (One-to-Many, for queries only)
Deal.hasMany(Unlock, { 
  foreignKey: "deal_id",
  sourceKey: "id",
  constraints: false
});

// DealClaim -> User (Many-to-One)
DealClaim.belongsTo(User, { 
  foreignKey: "user_id",
  targetKey: "id"
});
// User -> DealClaim (One-to-Many, for queries only)
User.hasMany(DealClaim, { 
  foreignKey: "user_id",
  sourceKey: "id",
  constraints: false
});

// DealClaim -> Deal (Many-to-One)
DealClaim.belongsTo(Deal, { 
  foreignKey: "deal_id",
  targetKey: "id"
});
// Deal -> DealClaim (One-to-Many, for queries only)
Deal.hasMany(DealClaim, { 
  foreignKey: "deal_id",
  sourceKey: "id",
  constraints: false
});

// UserDealException -> User (Many-to-One)
UserDealException.belongsTo(User, { 
  foreignKey: "user_id",
  targetKey: "id"
});
// User -> UserDealException (One-to-Many, for queries only, with alias)
User.hasMany(UserDealException, { 
  foreignKey: "user_id",
  sourceKey: "id",
  as: "dealExceptions",
  constraints: false
});

// UserDealException -> Deal (Many-to-One)
UserDealException.belongsTo(Deal, { 
  foreignKey: "deal_id",
  targetKey: "id"
});
// Deal -> UserDealException (One-to-Many, for queries only)
Deal.hasMany(UserDealException, { 
  foreignKey: "deal_id",
  sourceKey: "id",
  constraints: false
});

module.exports = {
  sequelize,
  User,
  Service,
  Deal,
  Unlock,
  Purchase,
  AuditLog,
  UserSubscription,
  DealClaim,
  UserDealException,
  ServiceDeal
};
