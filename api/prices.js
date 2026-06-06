// api/prices.js — look up real scanned prices from Supabase
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { items } = req.body;
  if (!items?.length) return res.status(200).json({ prices: {} });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    // Get average prices per item name and store from receipt_items
    const names = items.map(i => i.name?.toLowerCase()).filter(Boolean);
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/receipt_items?select=name,price,receipts(store_name)&name=ilike.any.{${names.map(n => `*${n}*`).join(",")}}`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!response.ok) return res.status(200).json({ prices: {} });

    const data = await response.json();

    // Build averages per item per store
    const averages = {};
    for (const row of data) {
      const store = row.receipts?.store_name;
      const name = row.name?.toLowerCase();
      const price = parseFloat(row.price);
      if (!store || !name || isNaN(price) || price <= 0) continue;
      if (!averages[name]) averages[name] = {};
      if (!averages[name][store]) averages[name][store] = { total: 0, count: 0 };
      averages[name][store].total += price;
      averages[name][store].count += 1;
    }

    // Convert to simple avg
    const prices = {};
    for (const [name, stores] of Object.entries(averages)) {
      prices[name] = {};
      for (const [store, { total, count }] of Object.entries(stores)) {
        prices[name][store] = Math.round((total / count) * 100) / 100;
      }
    }

    return res.status(200).json({ prices });
  } catch (err) {
    console.error("Prices lookup error:", err);
    return res.status(200).json({ prices: {} });
  }
}
