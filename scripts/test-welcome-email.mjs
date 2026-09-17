import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestWelcome() {
  console.log('Sending Welcome email via Resend to princebprivate@gmail.com...');
  const res = await resend.emails.send({
    from: 'DNORA Atelier <onboarding@resend.dev>',
    to: ['princebprivate@gmail.com'],
    subject: 'Welcome to DNORA — Your Membership is Active',
    html: `
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
            Dear Prince Boghara,<br><br>
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
            <a href="http://localhost:3000/shop" class="btn">Explore the Collection</a>
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
    `
  });

  console.log('Result:', res);
}

sendTestWelcome().catch(console.error);
