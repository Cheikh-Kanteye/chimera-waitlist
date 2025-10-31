const { kv } = require("@vercel/kv");
const nodemailer = require("nodemailer");

// Nodemailer transporter
const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, name } = req.body;

    // Validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        message: "Email invalide",
      });
    }

    // Get current waitlist from KV
    const waitlist = (await kv.get("waitlist")) || [];

    // Check if already registered
    if (waitlist.some((entry) => entry.email === email)) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà enregistré sur la waitlist",
      });
    }

    // Add to waitlist
    const entry = {
      email,
      name: name || "",
      timestamp: new Date().toISOString(),
      position: waitlist.length + 1,
    };

    waitlist.push(entry);
    await kv.set("waitlist", waitlist);

    // Send confirmation email
    if (process.env.EMAIL_USER) {
      try {
        await transporter.sendMail({
          from: `"${process.env.APP_NAME || "Chimera"}" <${
            process.env.EMAIL_USER
          }>`,
          to: email,
          subject: `Bienvenue sur la waitlist ${
            process.env.APP_NAME || "Chimera"
          } ! 🎉`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .highlight { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Bienvenue sur la waitlist !</h1>
                </div>
                <div class="content">
                  <p>Bonjour${name ? " " + name : ""} 👋,</p>
                  <p>Merci de votre intérêt pour <strong>${
                    process.env.APP_NAME || "Chimera"
                  }</strong> !</p>
                  <div class="highlight">
                    <h2 style="margin: 0;">Votre position</h2>
                    <h1 style="margin: 10px 0; font-size: 48px;">#${
                      entry.position
                    }</h1>
                  </div>
                  <p>Vous êtes maintenant sur notre liste d'attente exclusive. Nous vous tiendrons informé(e) dès que nous serons prêts à lancer !</p>
                  <p><strong>Que se passe-t-il ensuite ?</strong></p>
                  <ul>
                    <li>🚀 Vous recevrez un accès prioritaire dès le lancement</li>
                    <li>📧 Des mises à jour exclusives sur notre progression</li>
                    <li>🎁 Des avantages réservés aux early adopters</li>
                  </ul>
                  <p>En attendant, n'hésitez pas à partager avec vos amis et collègues !</p>
                  <div class="footer">
                    <p>À très bientôt,<br>L'équipe ${
                      process.env.APP_NAME || "Chimera"
                    }</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Continue even if email fails
      }
    }

    res.json({
      success: true,
      message: "Inscription réussie !",
      position: entry.position,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue. Veuillez réessayer.",
    });
  }
}
