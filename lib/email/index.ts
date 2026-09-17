import { Resend } from "resend";
import nodemailer from "nodemailer";

interface SendOtpOptions {
  email: string;
  name?: string;
  otp: string;
}

/**
 * Sends a luxury-styled verification OTP email to the client.
 * Supports:
 * 1. Resend API (Official SDK - recommended for production scale: RESEND_API_KEY)
 * 2. SMTP / Brevo (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT)
 * 3. Gmail App Password (GMAIL_USER, GMAIL_PASS)
 * 4. Development mode: logs cleanly to console.
 */
export async function sendVerificationOtpEmail({ email, name, otp }: SendOtpOptions): Promise<{
  success: boolean;
  delivered: boolean;
  message?: string;
}> {
  const recipientName = name?.trim() || "Valued Client";

  console.log("=================================================");
  console.log(`🔑 [DNORA OTP] 6-Digit Code for ${email}: [ ${otp} ]`);
  console.log("=================================================");

  const resendApiKey = process.env.RESEND_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF9F6; margin: 0; padding: 40px 20px; color: #0E0E0E; }
        .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8E5DE; padding: 40px 32px; border-radius: 2px; }
        .brand { text-align: center; letter-spacing: 0.3em; font-size: 16px; font-weight: 700; color: #0E0E0E; margin-bottom: 24px; text-transform: uppercase; }
        .subbrand { text-align: center; letter-spacing: 0.2em; font-size: 10px; color: #C5A880; font-weight: 700; text-transform: uppercase; margin-bottom: 30px; }
        .title { font-size: 20px; font-weight: 600; text-align: center; margin-bottom: 12px; color: #0E0E0E; }
        .text { font-size: 13px; line-height: 1.6; color: #73706A; text-align: center; margin-bottom: 28px; }
        .otp-box { background: #F5F3EF; border: 1px solid #E8E5DE; padding: 20px; text-align: center; border-radius: 2px; margin-bottom: 28px; }
        .otp-code { font-size: 34px; letter-spacing: 0.25em; font-weight: 800; color: #0E0E0E; font-family: monospace; }
        .expiry { font-size: 11px; color: #73706A; text-align: center; margin-top: 10px; }
        .footer { text-align: center; font-size: 11px; color: #A8A59E; margin-top: 36px; border-top: 1px solid #E8E5DE; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">DNORA</div>
        <div class="subbrand">Client Concierge</div>
        <div class="title">Email Verification Code</div>
        <p class="text">
          Dear ${recipientName},<br>
          Please enter the following one-time verification code to confirm your email and complete your DNORA account registration:
        </p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="expiry">Valid for 10 minutes</div>
        </div>
        <p class="text" style="font-size: 11px; margin-bottom: 0;">
          If you did not initiate this registration request, please disregard this email. Never share this code with anyone.
        </p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} DNORA Luxury Handbags & Leather Goods Atelier.<br>All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  let lastError: string | null = null;

  // 1. Long Scale Production: Official Resend SDK
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.EMAIL_FROM || "DNORA Atelier <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `Your DNORA Verification Code: ${otp}`,
        html: htmlContent,
      });

      if (!error && data?.id) {
        console.log("Resend successfully dispatched email:", data.id);
        return {
          success: true,
          delivered: true,
          message: "Verification code sent to your email inbox via Resend.",
        };
      }

      if (error) {
        console.error("Resend API error:", error);
        lastError = error.message;
      }
    } catch (resendErr: unknown) {
      console.error("Resend dispatch error:", resendErr);
      lastError = resendErr instanceof Error ? resendErr.message : String(resendErr);
    }
  }

  // 2. SMTP (Brevo / SendGrid / Custom SMTP) or Gmail
  const hasGmail = Boolean(gmailUser && gmailPass);
  const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass);

  if (hasGmail || hasSmtp) {
    try {
      const transporter = hasGmail
        ? nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: gmailUser,
              pass: gmailPass,
            },
          })
        : nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

      await transporter.sendMail({
        from: hasGmail
          ? `"DNORA Atelier" <${gmailUser}>`
          : process.env.EMAIL_FROM || `"DNORA Atelier" <${smtpUser}>`,
        to: email,
        subject: `Your DNORA Verification Code: ${otp}`,
        text: `Your DNORA one-time verification code is: ${otp}. It will expire in 10 minutes.`,
        html: htmlContent,
      });

      return {
        success: true,
        delivered: true,
        message: "Verification code sent to your email address.",
      };
    } catch (err: unknown) {
      console.error("Failed to send verification email via nodemailer:", err);
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  // 3. Fallback: Email could not be dispatched
  return {
    success: false,
    delivered: false,
    message:
      lastError ||
      "No email provider configured. Please set RESEND_API_KEY, GMAIL_USER/GMAIL_PASS, or SMTP credentials.",
  };
}

interface SendWelcomeOptions {
  email: string;
  name?: string | null;
}

/**
 * Sends a prestigious congratulations/welcome email to the client upon successful registration.
 */
export async function sendWelcomeEmail({ email, name }: SendWelcomeOptions): Promise<{
  success: boolean;
  delivered: boolean;
  message?: string;
}> {
  const recipientName = name?.trim() || "Valued Client";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  console.log("=================================================");
  console.log(`🎉 [DNORA WELCOME] Sending welcome email to: ${email}`);
  console.log("=================================================");

  const resendApiKey = process.env.RESEND_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF9F6; margin: 0; padding: 40px 20px; color: #0E0E0E; }
        .container { max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8E5DE; padding: 44px 36px; border-radius: 2px; }
        .brand { text-align: center; letter-spacing: 0.35em; font-size: 18px; font-weight: 800; color: #0E0E0E; margin-bottom: 8px; text-transform: uppercase; }
        .subbrand { text-align: center; letter-spacing: 0.22em; font-size: 10px; color: #C5A880; font-weight: 700; text-transform: uppercase; margin-bottom: 32px; }
        .hero-banner { background: #F5F3EF; border: 1px solid #E8E5DE; padding: 28px 20px; text-align: center; border-radius: 2px; margin-bottom: 30px; }
        .title { font-size: 22px; font-weight: 600; text-align: center; margin-bottom: 8px; color: #0E0E0E; font-family: Georgia, serif; }
        .subtitle { font-size: 12px; color: #73706A; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; }
        .text { font-size: 14px; line-height: 1.7; color: #4A4844; margin-bottom: 24px; }
        .perks { background: #FAF9F6; border: 1px solid #E8E5DE; padding: 20px 24px; margin-bottom: 30px; border-radius: 2px; }
        .perk-item { font-size: 12px; line-height: 1.8; color: #0E0E0E; margin-bottom: 8px; }
        .perk-bullet { color: #C5A880; font-weight: bold; margin-right: 8px; }
        .button-wrap { text-align: center; margin: 34px 0 20px; }
        .btn { display: inline-block; background-color: #0E0E0E; color: #FAF9F6 !important; padding: 14px 32px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; border-radius: 2px; }
        .footer { text-align: center; font-size: 11px; color: #A8A59E; margin-top: 36px; border-top: 1px solid #E8E5DE; padding-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">DNORA</div>
        <div class="subbrand">Client Concierge</div>
        
        <div class="hero-banner">
          <div class="title">Welcome to DNORA</div>
          <div class="subtitle">Membership Confirmed & Activated</div>
        </div>

        <p class="text">
          Dear ${recipientName},<br><br>
          It is an absolute pleasure to welcome you to the exclusive <strong>DNORA Client Registry</strong>. Your account has been successfully verified and is now fully active.
        </p>

        <div class="perks">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; color: #73706A; margin-bottom: 12px;">
            Your Member Privileges
          </div>
          <div class="perk-item">
            <span class="perk-bullet">&#9670;</span>
            <span>Private access to limited artisan handbag collections and atelier releases.</span>
          </div>
          <div class="perk-item">
            <span class="perk-bullet">&#9670;</span>
            <span>Seamless real-time order tracking and saved delivery address registry.</span>
          </div>
          <div class="perk-item">
            <span class="perk-bullet">&#9670;</span>
            <span>Complimentary white-glove packaging and priority dispatch.</span>
          </div>
        </div>

        <div class="button-wrap">
          <a href="${siteUrl}/shop" class="btn">Explore the Collection</a>
        </div>

        <p class="text" style="font-size: 12px; text-align: center; color: #73706A; margin-top: 24px;">
          Should you require bespoke concierge assistance or order guidance, our atelier team is always at your service.
        </p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} DNORA Luxury Handbags & Leather Goods Atelier.<br>
          Florence &bull; Mumbai &bull; London
        </div>
      </div>
    </body>
    </html>
  `;

  let lastError: string | null = null;

  // 1. Resend API
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.EMAIL_FROM || "DNORA Atelier <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: "Welcome to DNORA — Your Membership is Active",
        html: htmlContent,
      });

      if (!error && data?.id) {
        console.log("Resend Welcome Email sent successfully:", data.id);
        return { success: true, delivered: true, message: "Welcome email delivered via Resend." };
      }

      if (error) {
        console.error("Resend Welcome Email error:", error);
        lastError = error.message;
      }
    } catch (err: unknown) {
      console.error("Resend welcome email error:", err);
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  // 2. SMTP / Gmail
  const hasGmail = Boolean(gmailUser && gmailPass);
  const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass);

  if (hasGmail || hasSmtp) {
    try {
      const transporter = hasGmail
        ? nodemailer.createTransport({
            service: "gmail",
            auth: { user: gmailUser, pass: gmailPass },
          })
        : nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
          });

      await transporter.sendMail({
        from: hasGmail
          ? `"DNORA Atelier" <${gmailUser}>`
          : process.env.EMAIL_FROM || `"DNORA Atelier" <${smtpUser}>`,
        to: email,
        subject: "Welcome to DNORA — Your Membership is Active",
        text: `Dear ${recipientName},\n\nWelcome to DNORA. Your membership account has been verified and is active.\n\nExplore our collections: ${siteUrl}/shop`,
        html: htmlContent,
      });

      return { success: true, delivered: true, message: "Welcome email delivered via SMTP." };
    } catch (err: unknown) {
      console.error("SMTP Welcome email error:", err);
      lastError = err instanceof Error ? err.message : "SMTP delivery failed";
    }
  }

  return {
    success: false,
    delivered: false,
    message: lastError || "Welcome email could not be dispatched (no email provider configured).",
  };
}

