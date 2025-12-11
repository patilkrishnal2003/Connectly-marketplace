const { sequelize, User, Service, Deal } = require("./models");
const dotenv = require("dotenv");
dotenv.config();

async function seed() {
  try {
    console.log("Authenticating DB...");
    await sequelize.authenticate();
    console.log("DB authenticated.");
  } catch (err) {
    console.error("Failed to authenticate DB:", err && err.message ? err.message : err);
    process.exit(1);
  }

  try {
    console.log("Syncing models (this may alter tables)...");
    await sequelize.sync({ alter: true });
    console.log("Sync complete.");
  } catch (err) {
    console.error("Failed to sync schema:", err && err.message ? err.message : err);
    process.exit(1);
  }

  try {
    console.log("Creating demo user...");
    await User.findOrCreate({
      where: { id: "user_1" },
      defaults: { email: "demo@user.com", name: "Demo User", role: "user" }
    });

    console.log("Creating demo service...");
    const [service] = await Service.findOrCreate({
      where: { id: "service_basic" },
      defaults: { title: "Starter Plan", price: 199 }
    });

    console.log("Creating deals...");
    const [d1] = await Deal.findOrCreate({
      where: { id: "deal_canva_30" },
      defaults: {
        title: "30% off Canva",
        partner: "Canva",
        type: "coupon",
        coupon_code: "CANVA30DEMO",
        link: "https://canva.com",
        locked_by_default: true,
        featured: true
      }
    });

    const [d2] = await Deal.findOrCreate({
      where: { id: "deal_figma_50" },
      defaults: {
        title: "50% off Figma",
        partner: "Figma",
        type: "coupon",
        coupon_code: "FIGMA50DEMO",
        link: "https://figma.com",
        locked_by_default: true,
        featured: false
      }
    });

    console.log("Mapping service to deal...");
    // ensure mapping exists without heavy transaction
    await service.addDeal(d1);

    console.log("Seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err && err.message ? err.message : err);
    // print stack for more context
    console.error(err.stack || err);
    process.exit(1);
  }
}

seed();
