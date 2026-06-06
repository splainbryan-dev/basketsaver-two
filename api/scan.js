// api/scan.js — Vercel serverless function to proxy Anthropic API
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { image, mediaType, mode } = req.body;

    const prompt = mode === "receipt"
      ? `You are analyzing a grocery receipt image. Extract ALL products listed on this receipt.
For each product extract:
- name (product name as shown)
- price (numeric, the item price)
- quantity (how many, default 1)
- category (one of: Dairy & Eggs, Meat & Seafood, Fresh Produce, Bakery & Bread, Pantry, Frozen, Breakfast & Cereal, Snacks, Beverages, Deli, Candy, Baking, Alcohol, International)
- store_name (the store name if visible at top of receipt, otherwise null)
- receipt_date (date on receipt in YYYY-MM-DD format if visible, otherwise null)
- receipt_total (the final total on the receipt if visible, otherwise null)

Respond ONLY with a JSON object, no markdown:
{"store_name": null, "receipt_date": null, "receipt_total": null, "items": [{"name":"...","price":0.00,"quantity":1,"category":"..."}]}`
      : `You are analyzing a grocery product photo. Extract the product details.
Respond ONLY with JSON, no markdown:
{"name":"product name","brand":"brand if visible","price":0.00,"category":"one of: Dairy & Eggs, Meat & Seafood, Fresh Produce, Bakery & Bread, Pantry, Frozen, Breakfast & Cereal, Snacks, Beverages, Deli, Candy, Baking, Alcohol, International","size":"size/weight if visible"}
If you cannot identify the product, return: {"name":"Unknown Product","price":0,"category":"Pantry"}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", response.status, err);
      return res.status(200).json({ 
        store_name: null, 
        receipt_date: null, 
        receipt_total: null, 
        items: [],
        _debug: `Anthropic ${response.status}: ${err.substring(0, 200)}`
      });
    }

    const data = await response.json();
    const text = data.content?.map(c => c.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Scan error:", err);
    return res.status(500).json({ error: err.message });
  }
}
