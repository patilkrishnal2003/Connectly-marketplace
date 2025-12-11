const nodemailer = require("nodemailer");

function buildTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT) {
    return null;
  }

  const secure = SMTP_SECURE === "true" || Number(SMTP_PORT) === 465;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,
    auth: SMTP_USER
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
  });
}

function planNameFromId(planId) {
  const map = {
    standard: "Standard",
    professional: "Professional",
  };
  return map[planId] || planId || "your selected";
}

async function sendPlanConfirmationEmail({ to, planId }) {
  if (!to || !planId) {
    throw new Error("email and planId are required");
  }

  const transporter = buildTransport();
  const planName = planNameFromId(planId);
  const from = process.env.SMTP_FROM || "no-reply@connecttly.local";

  const subject = `Confirm your ${planName} subscription`;
  const text = `You requested the ${planName} plan. Click the link to confirm your subscription.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">Confirm your ${planName} subscription</h2>
      <p style="margin: 0 0 8px;">Thanks for choosing the ${planName} plan.</p>
      <p style="margin: 0 0 12px;">Click the button below to confirm your subscription.</p>
      <a
        href="${process.env.APP_BASE_URL || "https://connecttly.com"}/confirm?plan=${encodeURIComponent(planId)}&email=${encodeURIComponent(to)}"
        style="display:inline-block;padding:12px 18px;border-radius:10px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:bold;"
      >
        Confirm ${planName}
      </a>
      <p style="margin: 16px 0 0; font-size: 12px; color: #475569;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    console.log("[mailer] SMTP not configured. Skipping send.", { to, planId, subject });
    return { skipped: true, reason: "smtp_not_configured" };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { ok: true };
}

module.exports = { sendPlanConfirmationEmail };
