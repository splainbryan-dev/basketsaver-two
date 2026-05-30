export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join("/") : path || "";
    const url = new URL(req.url, "http://localhost");
    const queryString = url.search || "";
    const targetUrl = `https://api.kroger.com/v1/${apiPath}${queryString}`;
    
    console.log("[kroger-api] →", targetUrl);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Authorization": req.headers.authorization || "",
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
