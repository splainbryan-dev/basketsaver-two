// api/scan.js
// Vercel serverless function — proxies receipt/product scans to Anthropic API
// Keeps the API key server-side and out of the browser bundle

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64Data, mediaType, mode } = req.body;

  if (!base64Data || !mediaType || !mode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = mode === "receipt"
    ? `You are analyzing a grocery receipt image. Extract ALL products listed on this receipt.
For each product, extract:
- name (product name as shown)
- price (numeric, the item price)
- quantity (how many, default 1)
- category (one of: Dairy & Eggs, Meat & Seafood, Fresh Produce, Bakery & Bread, Pantry, Frozen, Breakfast & Cereal, Snacks, Beverages, Deli, Candy, Baking, Alcohol, Global Cuisine)

Respond ONLY with a JSON array, no markdown, no extra text:
[{"name":"...","price":0.00,"quantity":1,"category":"..."}]

If you cannot read the receipt clearly, return an empty array: []`
    : `You are analyzing a grocery product photo. Extract the product details.
Respond ONLY with JSON, no markdown, no extra text:
{"name":"product name","brand":"brand if visible","price":0.00,"category":"one of: Dairy & Eggs, Meat & Seafood, Fresh Produce, Bakery & Bread, Pantry, Frozen, Breakfast & Cereal, Snacks, Beverages, Deli, Candy, Baking, Alcohol, Global Cuisine","size":"size/weight if visible","description":"brief description"}
If you cannot identify the product, return: {"name":"Unknown Product","price":0,"category":"Pantry"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(500).json({ error: `Anthropic API error: ${response.status}` });
    }

    const data = await response.json();
    const text = data.content?.map(c => c.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ result: parsed });

  } catch (err) {
    console.error("Scan error:", err);
    return res.status(500).json({ error: err.message || "Failed to analyze image" });
  }
}
