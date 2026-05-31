// src/api/kroger.js
// Kroger Public API client
// On first load, finds a real Kroger store near Dallas TX (75201)
// and caches the locationId for all subsequent calls.

const KROGER_BASE      = "/kroger-api";
const KROGER_AUTH_BASE = "/kroger-auth";

export const DEFAULT_STORE_NAME = "Kroger";

// ---------- Token cache ----------
let _tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (_tokenCache.token && now < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  const res = await fetch(`${KROGER_AUTH_BASE}/v1/connect/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

// ---------- Location cache ----------
let _locationId = null;

// Find nearest Kroger store by zip code
async function getLocationId(zip = "45202") {
  if (_locationId) return _locationId;

  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({
      "filter.zipCode.near": zip,
      "filter.limit": "1",
      "filter.chain": "KROGER",
    });

    const res = await fetch(`${KROGER_BASE}/locations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Location lookup failed: ${res.status}`);
    const data = await res.json();
    const stores = data.data || [];

    if (stores.length > 0) {
      _locationId = stores[0].locationId;
      console.log("[kroger] Found store:", _locationId, stores[0].name);
      return _locationId;
    }
  } catch (err) {
    console.warn("[kroger] Location lookup failed, trying without locationId:", err.message);
  }

  return "62000112"; // Cincinnati OH fallback
}

export let DEFAULT_LOCATION_ID = null; // Resolved dynamically via getLocationId()

// ---------- Product search ----------
export async function searchProducts(term, locationId = null, limit = 24) {
  const token = await getAccessToken();
  const locId = await getLocationId(); // Always use dynamic lookup — caches after first call

  const params = new URLSearchParams({
    "filter.term":        term,
    "filter.limit":       String(limit),
    "filter.fulfillment": "ais",
  });

  // Only add locationId if we have one
  if (locId) params.set("filter.locationId", locId);

  const res = await fetch(`${KROGER_BASE}/products?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Product search failed: ${res.status}`);
  const data = await res.json();
  return normalizeProducts(data.data || []);
}

// ---------- Products by category ----------
const CATEGORY_TERMS = {
  "Meat & Seafood":     ["meat", "chicken", "beef", "seafood", "fish"],
  "Fresh Produce":      ["apples", "bananas", "lettuce", "tomatoes", "vegetables"],
  "Dairy & Eggs":       ["milk", "eggs", "cheese", "butter", "yogurt"],
  "Bakery & Bread":     ["bread", "bagels", "muffins", "rolls"],
  Frozen:               ["frozen pizza", "frozen meals", "ice cream"],
  Pantry:               ["canned soup", "pasta sauce", "rice", "beans"],
  "Breakfast & Cereal": ["cereal", "oatmeal", "granola", "pancake mix"],
  Baking:               ["flour", "sugar", "baking powder", "vanilla"],
  Snacks:               ["chips", "crackers", "popcorn", "pretzels"],
  Candy:                ["chocolate", "candy", "gummies"],
  Beverages:            ["juice", "soda", "water", "coffee", "tea"],
  Alcohol:              ["beer", "wine"],
  International:        ["tortillas", "soy sauce", "salsa"],
  Deli:                 ["deli meat", "hummus", "cheese"],
};

export async function getProductsByCategory(category, locationId = null, limit = 50, termIndex = 0) {
  const terms = CATEGORY_TERMS[category] || [category.toLowerCase()];
  const idx = termIndex % terms.length;
  const term = terms[idx];
  const products = await searchProducts(term, locationId, limit);
  return {
    products,
    hasMore: termIndex + 3 < terms.length * 3,
  };
}

// ---------- Featured products ----------
export async function getFeaturedProducts(locationId = null, limit = 48) {
  const terms = ["chicken", "milk", "bread", "eggs", "fruit", "snacks", "pasta", "cereal"];
  const term  = terms[Math.floor(Date.now() / 60000) % terms.length];
  return searchProducts(term, locationId, limit);
}

// ---------- Sale products ----------
export async function getSaleProducts(locationId = null, limit = 24) {
  const products = await searchProducts("sale", locationId, limit);
  return products.filter((p) => p.on_sale);
}

// ---------- Find store by zip ----------
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
  if (!stores.length) return "62000112"; // Cincinnati OH fallback
  const store = stores[0];
  _locationId = store.locationId; // Cache it
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
