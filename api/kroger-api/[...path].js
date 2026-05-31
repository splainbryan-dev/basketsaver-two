export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Get the path segments from the URL directly
    // req.url will be like /kroger-api/products?filter.term=milk
    const fullUrl = req.url;
    const withoutPrefix = fullUrl.replace(/^\/kroger-api\//, "");
    const [pathPart, queryPart] = withoutPrefix.split("?");
    
    const targetUrl = `https://api.kroger.com/v1/${pathPart}${queryPart ? "?" + queryPart : ""}`;
    
    console.log("[kroger-api] →", targetUrl);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Authorization": req.headers.authorization || "",
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const text = await response.text();
    console.log("[kroger-api] status:", response.status, "body:", text.slice(0, 300));

    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch {
      return res.status(response.status).json({ error: text });
    }
  } catch (err) {
    console.error("[kroger-api] error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
