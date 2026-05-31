// src/api/kroger.js
// Kroger Public API client
// Hardcoded to Dallas TX Kroger store for consistent product images.
// Store: Kroger #612 — 7510 Greenville Ave, Dallas TX 75231
// locationId: 62000112  (Kroger Dallas - Greenville Ave)
//
// Using a hardcoded Dallas store means:
// 1. Images always load (location-specific images are higher quality)
// 2. Prices are real Dallas Kroger prices (good US national baseline)
// 3. No zip code needed from user
// 4. App works instantly on first load

// Works in both local dev (via Vite proxy) and production (via Vercel functions)
const KROGER_BASE      = "/kroger-api";
const KROGER_AUTH_BASE = "/kroger-auth";

// Dallas TX Kroger store — used for all product/price lookups
export const DEFAULT_LOCATION_ID = "62000112";
export const DEFAULT_STORE_NAME  = "Kroger - Dallas, TX";

// ---------- Token cache ----------
let _tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (_tokenCache.token && now < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  // Auth is handled server-side by the /kroger-auth proxy.
  // No client-side credentials needed — the Vercel function reads them from process.env.
  const res = await fetch(`${KROGER_AUTH_BASE}/v1/connect/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=product.compact",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kroger auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  _tokenCache = {
    token:     data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return _tokenCache.token;
}

// ---------- Product search ----------
export async function searchProducts(term, locationId = DEFAULT_LOCATION_ID, limit = 24) {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    "filter.term":        term,
    "filter.limit":       String(limit),
    "filter.fulfillment": "ais",
    "filter.locationId":  locationId,
  });

  const res = await fetch(`${KROGER_BASE}/products?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Product search failed: ${res.status}`);
  const data = await res.json();
  return normalizeProducts(data.data || []);
}

// ---------- Products by category ----------
const CATEGORY_TERMS = {
  "Meat & Seafood":     "meat seafood",
  "Fresh Produce":      "fresh produce",
  "Dairy & Eggs":       "dairy eggs milk",
  "Bakery & Bread":     "bread bakery",
  Frozen:               "frozen",
  Pantry:               "pantry staples canned",
  "Breakfast & Cereal": "cereal breakfast oatmeal",
  Baking:               "baking flour sugar",
  Snacks:               "snacks chips crackers",
  Candy:                "candy chocolate",
  Beverages:            "beverages drinks juice soda",
  Alcohol:              "beer wine spirits",
  International:        "international ethnic foods",
  Deli:                 "deli prepared foods",
};

export async function getProductsByCategory(category, locationId = DEFAULT_LOCATION_ID, limit = 24) {
  const term = CATEGORY_TERMS[category] || category.toLowerCase();
  return searchProducts(term, locationId, limit);
}

// ---------- Featured products ----------
// Loads a variety of popular items for the homepage
export async function getFeaturedProducts(locationId = DEFAULT_LOCATION_ID, limit = 48) {
  const token = await getAccessToken();

  // Use broad popular terms to get a good variety
  const terms = ["chicken", "milk", "bread", "eggs", "fruit", "snacks", "pasta", "cereal"];
  const term  = terms[Math.floor(Date.now() / 60000) % terms.length]; // Rotates every minute

  const params = new URLSearchParams({
    "filter.term":        term,
    "filter.limit":       String(limit),
    "filter.fulfillment": "ais",
    "filter.locationId":  locationId,
  });

  const res = await fetch(`${KROGER_BASE}/products?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Featured products failed: ${res.status}`);
  const data = await res.json();
  return normalizeProducts(data.data || []);
}

// ---------- Sale products ----------
export async function getSaleProducts(locationId = DEFAULT_LOCATION_ID, limit = 24) {
  const products = await searchProducts("sale", locationId, limit);
  return products.filter((p) => p.on_sale);
}

// ---------- Find store by zip (kept for future use) ----------
export async function findNearestStore(zipCode) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    "filter.zipCode.near": zipCode,
    "filter.limit":        "1",
    "filter.chain":        "KROGER",
  });
  const res = await fetch(`${KROGER_BASE}/locations?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Store lookup failed: ${res.status}`);
  const data = await res.json();
  const stores = data.data || [];
  if (!stores.length) return null;
  const store = stores[0];
  return {
    locationId: store.locationId,
    name:       store.name,
    address:    store.address?.addressLine1,
    city:       store.address?.city,
    state:      store.address?.state,
    zip:        store.address?.zipCode,
  };
}

// ---------- Normalize ----------
function normalizeProducts(raw) {
  return raw
    .map((item) => {
      const priceInfo    = item.items?.[0]?.price || {};
      const regularPrice = priceInfo.regular ?? null;
      const promoPrice   = priceInfo.promo   ?? null;
      const onSale       = promoPrice !== null && promoPrice < regularPrice;
      const activePrice  = onSale ? promoPrice : regularPrice;

      // Images — prefer large front image
      const images       = item.images || [];
      const frontImages  = images.filter((img) => img.perspective === "front");
      const imageObj     =
        frontImages.find((img) => img.sizes?.find((s) => s.size === "large")) ||
        frontImages.find((img) => img.sizes?.find((s) => s.size === "medium")) ||
        frontImages[0] ||
        images[0];

      const imageUrl =
        imageObj?.sizes?.find((s) => s.size === "large")?.url  ||
        imageObj?.sizes?.find((s) => s.size === "medium")?.url ||
        imageObj?.sizes?.[0]?.url ||
        null;

      const krogerCategory = item.categories?.[0] || "Other";
      const mappedCategory = mapKrogerCategory(krogerCategory);

      let discountPct = 0;
      if (onSale && regularPrice > 0) {
        discountPct = Math.round(((regularPrice - promoPrice) / regularPrice) * 100);
      }

      return {
        id:                  item.productId,
        upc:                 item.upc,
        name:                item.description,
        brand:               item.brand || "",
        description:         item.items?.[0]?.description || "",
        category:            mappedCategory,
        image_url:           imageUrl,
        price:               activePrice,
        original_price:      onSale ? regularPrice : null,
        on_sale:             onSale,
        discount_percentage: discountPct,
        unit:                item.items?.[0]?.size || "",
        store:               "Kroger",
        kroger_price:        activePrice,
        kroger_category:     krogerCategory,
        weight_class:        "standard",
        source:              "kroger",
      };
    })
    .filter((p) => p.price !== null && p.price > 0);
}

function mapKrogerCategory(krogerCat) {
  const cat = krogerCat.toLowerCase();
  if (cat.includes("meat") || cat.includes("seafood") || cat.includes("poultry"))    return "Meat & Seafood";
  if (cat.includes("produce") || cat.includes("fruit") || cat.includes("vegetable")) return "Fresh Produce";
  if (cat.includes("dairy") || cat.includes("egg") || cat.includes("cheese") || cat.includes("milk")) return "Dairy & Eggs";
  if (cat.includes("bread") || cat.includes("bakery") || cat.includes("baked"))      return "Bakery & Bread";
  if (cat.includes("frozen"))                                                          return "Frozen";
  if (cat.includes("snack") || cat.includes("chip") || cat.includes("cracker"))      return "Snacks";
  if (cat.includes("candy") || cat.includes("chocolate"))                             return "Candy";
  if (cat.includes("beverage") || cat.includes("drink") || cat.includes("juice") || cat.includes("water") || cat.includes("soda")) return "Beverages";
  if (cat.includes("beer") || cat.includes("wine") || cat.includes("spirit"))        return "Alcohol";
  if (cat.includes("breakfast") || cat.includes("cereal") || cat.includes("oatmeal"))return "Breakfast & Cereal";
  if (cat.includes("baking") || cat.includes("flour") || cat.includes("sugar"))      return "Baking";
  if (cat.includes("deli") || cat.includes("prepared"))                               return "Deli";
  if (cat.includes("spice") || cat.includes("seasoning") || cat.includes("herb"))   return "Spices & Seasonings";
  if (cat.includes("international") || cat.includes("ethnic"))                        return "International";
  return "Pantry";
}
