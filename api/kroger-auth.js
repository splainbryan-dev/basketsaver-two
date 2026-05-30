// api/kroger-auth.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const clientId     = process.env.VITE_KROGER_CLIENT_ID;
    const clientSecret = process.env.VITE_KROGER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: "Missing VITE_KROGER_CLIENT_ID or VITE_KROGER_CLIENT_SECRET" });
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // The app calls: /kroger-auth/v1/connect/oauth2/token
    // Strip /api/kroger-auth to get /v1/connect/oauth2/token
    const stripped = req.url.replace(/^\/api\/kroger-auth/, "") || "/v1/connect/oauth2/token";
    const targetUrl = `https://api.kroger.com${stripped}`;

    console.log("[kroger-auth] →", targetUrl);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials&scope=product.compact",
    });

    const data = await response.json();
    console.log("[kroger-auth] status:", response.status);
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("[kroger-auth] error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
