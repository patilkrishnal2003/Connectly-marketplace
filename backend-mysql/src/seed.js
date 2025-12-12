const { sequelize, User, Service, Deal, ServiceDeal } = require("./models");
const dotenv = require("dotenv");
dotenv.config();

async function seed() {
  await sequelize.sync({ alter: true });

  // create demo user if not exists
  const [user, uCreated] = await User.findOrCreate({
    where: { id: "user_1" },
    defaults: { email: "demo@user.com", name: "Demo User", role: "user" }
  });

  // create demo service
  const [service] = await Service.findOrCreate({
    where: { id: "service_basic" },
    defaults: { title: "Starter Plan", price: 199, code: "standard" }
  });
  await Service.findOrCreate({
    where: { id: "service_pro" },
    defaults: { title: "Professional Plan", price: 399, code: "professional" }
  });

  // create deals (inspired by popular startup perks)
  const dealsToSeed = [
    {
      id: "deal_canva_pro",
      title: "Canva Pro for Startups",
      partner: "Canva",
      type: "link",
      link: "https://www.canva.com/",
      locked_by_default: false,
      tier: "standard",
      featured: true
    },
    {
      id: "deal_notion",
      title: "Notion for Startups",
      partner: "Notion",
      type: "link",
      link: "https://www.notion.so/startups",
      locked_by_default: false,
      tier: "standard",
      featured: true
    },
    {
      id: "deal_stripe_atlas",
      title: "Stripe Atlas",
      partner: "Stripe",
      type: "link",
      link: "https://stripe.com/atlas",
      locked_by_default: true,
      tier: "professional",
      featured: true
    },
    {
      id: "deal_linear",
      title: "Linear Startup Program",
      partner: "Linear",
      type: "link",
      link: "https://linear.app/",
      locked_by_default: true,
      tier: "standard",
      featured: false
    },
    {
      id: "deal_postman",
      title: "Postman Credits",
      partner: "Postman",
      type: "link",
      link: "https://www.postman.com/",
      locked_by_default: true,
      tier: "standard",
      featured: false
    },
    {
      id: "deal_miro",
      title: "Miro Startup Offer",
      partner: "Miro",
      type: "link",
      link: "https://miro.com/",
      locked_by_default: false,
      tier: "standard",
      featured: false
    },
    {
      id: "deal_digitalocean",
      title: "DigitalOcean Credits",
      partner: "DigitalOcean",
      type: "link",
      link: "https://www.digitalocean.com/",
      locked_by_default: true,
      tier: "professional",
      featured: false
    },
    {
      id: "deal_mixpanel",
      title: "Mixpanel for Startups",
      partner: "Mixpanel",
      type: "link",
      link: "https://mixpanel.com/startups/",
      locked_by_default: true,
      tier: "professional",
      featured: false
    }
  ];

  for (const payload of dealsToSeed) {
    await Deal.findOrCreate({ where: { id: payload.id }, defaults: payload });
  }

  // map service -> deals (service_basic unlocks deal_canva_30)
  const seedUnlockDeal = await Deal.findOne({ where: { id: "deal_stripe_atlas" } });
  if (seedUnlockDeal) await service.addDeal(seedUnlockDeal);

  console.log("Seed complete");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
