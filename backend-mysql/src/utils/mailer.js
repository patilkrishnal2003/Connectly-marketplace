const nodemailer = require("nodemailer");

function buildTransport() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    SMTP_SERVICE
  } = process.env;

  // Default to Gmail settings when nothing is provided
  const host = (SMTP_HOST && SMTP_HOST !== "your.smtp.host") ? SMTP_HOST : "smtp.gmail.com";
  const parsedPort = Number.isFinite(parseInt(String(SMTP_PORT).split("#")[0], 10))
    ? parseInt(String(SMTP_PORT).split("#")[0], 10)
    : 465;
  const secure = SMTP_SECURE === "true" || parsedPort === 465;

  // Require real creds to send
  if (!SMTP_USER || !SMTP_PASS || SMTP_USER === "your_user" || SMTP_PASS === "your_password") {
    return null;
  }

  return nodemailer.createTransport({
    service: SMTP_SERVICE || undefined,
    host,
    port: parsedPort,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function planNameFromId(planId) {
  const map = { standard: "Standard", professional: "Professional" };
  return map[planId] || planId || "your selected";
}

async function sendPlanConfirmationEmail({ to, planId }) {
  if (!to || !planId) throw new Error("email and planId are required");

  const transporter = buildTransport();
  const planName = planNameFromId(planId);
  const from = process.env.SMTP_FROM || "manishpatil7821@gmail.com";
  const brandUrl =
    process.env.EMAIL_CONFIRM_BASE ||
    process.env.APP_BASE_URL ||
    `http://localhost:${process.env.PORT || 4000}`;
  const confirmUrl = `${brandUrl.replace(/\/$/, "")}/confirm?plan=${encodeURIComponent(planId)}&email=${encodeURIComponent(to)}`;

  const subject = `Confirm your ${planName} subscription`;
  const text = [
    `Hi,`,
    ``,
    `You requested the ${planName} plan. Click to confirm: ${confirmUrl}`,
    ``,
    `This email was sent from the Connecttly admin: ${from}.`,
    ``,
    `If you didn't request this, you can ignore this email.`
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">Confirm your ${planName} subscription</h2>
      <p style="margin: 0 0 8px;">Thanks for choosing the ${planName} plan.</p>
      <p style="margin: 0 0 12px;">Click the button below to confirm.</p>
      <a href="${confirmUrl}"
         style="display:inline-block;padding:12px 18px;border-radius:10px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:bold;">
         Confirm ${planName}
      </a>
      <p style="margin: 14px 0 6px; font-size: 13px; color: #475569;">If you didn't request this, ignore this email.</p>
      <p style="margin: 0; font-size: 12px; color: #475569;">Sent by Connecttly admin (${from})</p>
    </div>
  `;
  if (!transporter) {
    console.log("[mailer] SMTP not configured. Skipping send.", { to, planId, subject, from });
    return { skipped: true, reason: "smtp_not_configured" };
  }

  try {
    await transporter.sendMail({
      from: `"Connecttly Admin" <${from}>`,
      to,
      replyTo: to,
      subject,
      text,
      html
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer] send failed", err);
    return { skipped: true, reason: err.message || "smtp_send_failed" };
  }
}

async function sendContactEmail({ name, email, message }) {
  if (!name || !email || !message) throw new Error("name, email, and message are required");

  const transporter = buildTransport();
  const from = process.env.SMTP_FROM || "manishpatil7821@gmail.com";
  const to = "manishpatil7821@gmail.com"; // Fixed recipient email

  const subject = `New Contact Form Submission from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    ``,
    `Message:`,
    message,
    ``,
    `This email was sent from the Connecttly contact form.`
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">New Contact Form Submission</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p style="margin: 0 0 12px;"><strong>Message:</strong></p>
      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #4f46e5;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <p style="margin: 14px 0 6px; font-size: 12px; color: #475569;">Sent from Connecttly contact form</p>
    </div>
  `;

  if (!transporter) {
    console.log("[mailer] SMTP not configured. Skipping send.", { name, email, subject, to });
    return { skipped: true, reason: "smtp_not_configured" };
  }

  try {
    await transporter.sendMail({
      from: `"Connecttly Contact" <${from}>`,
      to,
      replyTo: email,
      subject,
      text,
      html
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer] send failed", err);
    return { skipped: true, reason: err.message || "smtp_send_failed" };
  }
}

module.exports = { sendPlanConfirmationEmail, sendContactEmail };
