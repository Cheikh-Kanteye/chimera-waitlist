const { kv } = require("@vercel/kv");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { password } = req.query;

    // Check password
    if (password !== "Ms2chsnnjj&kk") {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé",
      });
    }

    const waitlist = (await kv.get("waitlist")) || [];
    res.json({
      success: true,
      waitlist,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la waitlist",
    });
  }
}
