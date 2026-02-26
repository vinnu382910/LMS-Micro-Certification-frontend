const nodemailer = require("nodemailer");

const normalize = (value) => String(value || "").trim();

const getSmtpConfig = () => {
  const user = normalize(process.env.SMTP_USER);
  const pass = normalize(process.env.SMTP_PASS).replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("SMTP_USER or SMTP_PASS is missing.");
  }

  const host = normalize(process.env.SMTP_HOST) || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
  const appName = normalize(process.env.SMTP_APP_NAME) || "sbtexam";

  return { host, port, secure, user, pass, appName };
};

const getTransporter = () => {
  const cfg = getSmtpConfig();
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const cfg = getSmtpConfig();
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${cfg.appName}" <${cfg.user}>`,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async ({ to, name, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Email Verification OTP</h2>
      <p>Hi ${name || "Learner"},</p>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing:3px;">${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    </div>
  `;
  await sendEmail({ to, subject: "Your verification OTP", html });
};

const sendPasswordResetEmail = async ({ to, name, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Password Reset OTP</h2>
      <p>Hi ${name || "Learner"},</p>
      <p>Your password reset OTP is:</p>
      <h1 style="letter-spacing:3px;">${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    </div>
  `;
  await sendEmail({ to, subject: "Your password reset OTP", html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
