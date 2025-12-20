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

  // reset and create deals (inspired by popular startup perks)
  await ServiceDeal.destroy({ where: {} });
  await Deal.destroy({ where: {} });
  const dealsToSeed = [
    {
      id: "deal_notion",
      title: "Notion",
      partner: "Notion",
      type: "link",
      link: "https://www.notion.so/startups",
      locked_by_default: false,
      tier: "standard",
      featured: true
    },
    {
      id: "deal_aws",
      title: "AWS Activate",
      partner: "AWS",
      type: "link",
      link: "https://aws.amazon.com/activate/",
      locked_by_default: true,
      tier: "professional",
      featured: true
    },
    {
      id: "deal_figma",
      title: "Figma Professional",
      partner: "Figma",
      type: "link",
      link: "https://www.figma.com/enterprise/startups/",
      locked_by_default: false,
      tier: "standard",
      featured: true
    },
    {
      id: "deal_hubspot",
      title: "HubSpot for Startups",
      partner: "HubSpot",
      type: "link",
      link: "https://www.hubspot.com/startups",
      locked_by_default: false,
      tier: "standard",
      featured: true
    },
    {
      id: "deal_google_cloud",
      title: "Google Cloud for Startups",
      partner: "Google Cloud",
      type: "link",
      link: "https://cloud.google.com/startups",
      locked_by_default: true,
      tier: "professional",
      featured: true
    },
    {
      id: "deal_stripe_atlas",
      title: "Stripe Atlas",
      partner: "Stripe",
      type: "link",
      link: "https://stripe.com/startups",
      locked_by_default: true,
      tier: "professional",
      featured: true
    },
    {
      id: "deal_slack",
      title: "Slack for Startups",
      partner: "Slack",
      type: "link",
      link: "https://slack.com/startups",
      locked_by_default: false,
      tier: "standard",
      featured: false
    },
    {
      id: "deal_mongodb",
      title: "MongoDB Atlas",
      partner: "MongoDB",
      type: "link",
      link: "https://www.mongodb.com/startups",
      locked_by_default: true,
      tier: "standard",
      featured: false
    },
    {
      id: "deal_linear",
      title: "Linear",
      partner: "Linear",
      type: "link",
      link: "https://linear.app/startups",
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
