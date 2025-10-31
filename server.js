const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { kv } = require("@vercel/kv");

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize KV store with empty array if it doesn't exist
async function initKVStore() {
  try {
    const exists = await kv.exists("waitlist");
    if (!exists) {
      await kv.set("waitlist", []);
    }
  } catch (error) {
    console.error("Error initializing KV store:", error);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Read waitlist from KV
async function readWaitlist() {
  try {
    const data = await kv.get("waitlist");
    return data || [];
  } catch (error) {
    console.error("Error reading waitlist from KV:", error);
    return [];
  }
}

// Write waitlist to KV
async function writeWaitlist(data) {
  try {
    await kv.set("waitlist", data);
  } catch (error) {
    console.error("Error writing waitlist to KV:", error);
    throw error;
  }
}

// API: Join waitlist
app.post("/api/waitlist", async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        message: "Email invalide",
      });
    }

    // Read current waitlist
    const waitlist = await readWaitlist();

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
    await writeWaitlist(waitlist);

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
});

// API: Get waitlist count
app.get("/api/waitlist/count", async (req, res) => {
  try {
    const waitlist = await readWaitlist();
    res.json({
      success: true,
      count: waitlist.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du compte",
    });
  }
});

// API: Get all waitlist (protected - add auth in production)
app.get("/api/waitlist/all", async (req, res) => {
  try {
    const waitlist = await readWaitlist();
    res.json({
      success: true,
      waitlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la waitlist",
    });
  }
});

// Initialize and start server (only for local development)
if (!process.env.VERCEL) {
  initKVStore().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Waitlist app running on http://localhost:${PORT}`);
      console.log(`📧 Email configured: ${!!process.env.EMAIL_USER}`);
    });
  });
}

// Export for Vercel serverless deployment
module.exports = app;
