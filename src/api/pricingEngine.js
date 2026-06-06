// src/api/pricingEngine.js
// BasketSaver Pricing Algorithm v4
// New store lineup: Aldi, Lidl, WinCo, Walmart, Food Lion, Kroger, H-E-B, Sam's Club, Costco, Publix
// Kroger = real price baseline (from API). All others = algorithm estimates.
//
// Formula:
//   Item Estimate = Kroger Price × Store Category Multiplier × Daily Seeded Variance
//   Store Total = Σ Item Estimates + Missing Item Penalties
//   Final Total = Store Total × Basket Type Modifier

export const STORES_ORDERED = [
  "Aldi",
  "Lidl",
  "WinCo",
  "Walmart",
  "Food Lion",
  "Kroger",
  "H-E-B",
  "Sam's Club",
  "Costco",
  "Publix",
];

export const STORE_DATA_SOURCE = {
  "Aldi":       "algorithm",
  "Lidl":       "algorithm",
  "WinCo":      "algorithm",
  "Walmart":    "algorithm",
  "Food Lion":  "algorithm",
  "Kroger":     "real",
  "H-E-B":      "algorithm",
  "Sam's Club": "algorithm",
  "Costco":     "algorithm",
  "Publix":     "algorithm",
};

export const STORE_LINKS = {
  "Aldi":       "https://www.aldi.us",
  "Lidl":       "https://www.lidl.com",
  "WinCo":      "https://www.wincofoods.com",
  "Walmart":    "https://www.walmart.com/grocery",
  "Food Lion":  "https://www.foodlion.com",
  "Kroger":     "https://www.kroger.com",
  "H-E-B":      "https://www.heb.com",
  "Sam's Club": "https://www.samsclub.com",
  "Costco":     "https://www.costco.com",
  "Publix":     "https://www.publix.com",
};

// Per-store, per-category multipliers vs Kroger = 1.00
// WinCo frozen is intentionally ABOVE 1.00 per real-world user feedback
export const STORE_CATEGORY_MULTIPLIERS = {
  "Aldi": {
    "Dairy & Eggs":        0.82,
    "Meat & Seafood":      0.86,
    "Fresh Produce":       0.80,
    "Pantry":              0.78,
    "Snacks":              0.83,
    "Candy":               0.81,
    "Beverages":           0.85,
    "Frozen":              0.84,
    "Bakery & Bread":      0.79,
    "Breakfast & Cereal":  0.81,
    "Baking":              0.80,
    "Deli":                0.86,
    "Global Cuisine":      0.87,
    "Alcohol":             0.85,
    "Spices & Seasonings": 0.82,
    "Household":           0.88,
    "default":             0.84,
  },
  "Lidl": {
    "Dairy & Eggs":        0.83,
    "Meat & Seafood":      0.87,
    "Fresh Produce":       0.82,
    "Pantry":              0.80,
    "Snacks":              0.85,
    "Candy":               0.83,
    "Beverages":           0.86,
    "Frozen":              0.85,
    "Bakery & Bread":      0.80,
    "Breakfast & Cereal":  0.83,
    "Baking":              0.82,
    "Deli":                0.87,
    "Global Cuisine":      0.86,
    "Alcohol":             0.84,
    "Spices & Seasonings": 0.83,
    "Household":           0.89,
    "default":             0.85,
  },
  "WinCo": {
    "Dairy & Eggs":        0.85,
    "Meat & Seafood":      0.88,
    "Fresh Produce":       0.84,
    "Pantry":              0.83,
    "Snacks":              0.86,
    "Candy":               0.84,
    "Beverages":           0.86,
    "Frozen":              1.02,
    "Bakery & Bread":      0.86,
    "Breakfast & Cereal":  0.85,
    "Baking":              0.84,
    "Deli":                0.87,
    "Global Cuisine":      0.87,
    "Alcohol":             0.88,
    "Spices & Seasonings": 0.85,
    "Household":           0.86,
    "default":             0.87,
  },
  "Walmart": {
    "Dairy & Eggs":        0.91,
    "Meat & Seafood":      0.93,
    "Fresh Produce":       0.92,
    "Pantry":              0.89,
    "Snacks":              0.91,
    "Candy":               0.90,
    "Beverages":           0.90,
    "Frozen":              0.91,
    "Bakery & Bread":      0.91,
    "Breakfast & Cereal":  0.90,
    "Baking":              0.89,
    "Deli":                0.92,
    "Global Cuisine":      0.91,
    "Alcohol":             0.91,
    "Spices & Seasonings": 0.90,
    "Household":           0.87,
    "default":             0.91,
  },
  "Food Lion": {
    "Dairy & Eggs":        0.95,
    "Meat & Seafood":      0.96,
    "Fresh Produce":       0.95,
    "Pantry":              0.93,
    "Snacks":              0.95,
    "Candy":               0.94,
    "Beverages":           0.94,
    "Frozen":              0.95,
    "Bakery & Bread":      0.95,
    "Breakfast & Cereal":  0.94,
    "Baking":              0.93,
    "Deli":                0.96,
    "Global Cuisine":      0.95,
    "Alcohol":             0.95,
    "Spices & Seasonings": 0.94,
    "Household":           0.94,
    "default":             0.95,
  },
  "Kroger": {
    "default": 1.00,
  },
  "H-E-B": {
    "Dairy & Eggs":        0.95,
    "Meat & Seafood":      0.94,
    "Fresh Produce":       0.93,
    "Pantry":              0.94,
    "Snacks":              0.96,
    "Candy":               0.95,
    "Beverages":           0.95,
    "Frozen":              0.95,
    "Bakery & Bread":      0.94,
    "Breakfast & Cereal":  0.95,
    "Baking":              0.94,
    "Deli":                0.95,
    "Global Cuisine":      0.92,
    "Alcohol":             0.95,
    "Spices & Seasonings": 0.94,
    "Household":           0.94,
    "default":             0.94,
  },
  "Sam's Club": {
    "Dairy & Eggs":        0.88,
    "Meat & Seafood":      0.84,
    "Fresh Produce":       0.87,
    "Pantry":              0.85,
    "Snacks":              0.87,
    "Candy":               0.86,
    "Beverages":           0.84,
    "Frozen":              0.87,
    "Bakery & Bread":      0.90,
    "Breakfast & Cereal":  0.86,
    "Baking":              0.85,
    "Deli":                0.88,
    "Global Cuisine":      0.89,
    "Alcohol":             0.82,
    "Spices & Seasonings": 0.87,
    "Household":           0.80,
    "default":             0.87,
  },
  "Costco": {
    "Dairy & Eggs":        0.87,
    "Meat & Seafood":      0.81,
    "Fresh Produce":       0.86,
    "Pantry":              0.84,
    "Snacks":              0.86,
    "Candy":               0.85,
    "Beverages":           0.83,
    "Frozen":              0.86,
    "Bakery & Bread":      0.89,
    "Breakfast & Cereal":  0.85,
    "Baking":              0.84,
    "Deli":                0.87,
    "Global Cuisine":      0.88,
    "Alcohol":             0.81,
    "Spices & Seasonings": 0.86,
    "Household":           0.79,
    "default":             0.86,
  },
  "Publix": {
    "Dairy & Eggs":        1.10,
    "Meat & Seafood":      1.14,
    "Fresh Produce":       1.11,
    "Pantry":              1.08,
    "Snacks":              1.10,
    "Candy":               1.08,
    "Beverages":           1.09,
    "Frozen":              1.10,
    "Bakery & Bread":      1.12,
    "Breakfast & Cereal":  1.09,
    "Baking":              1.08,
    "Deli":                1.16,
    "Global Cuisine":      1.10,
    "Alcohol":             1.11,
    "Spices & Seasonings": 1.09,
    "Household":           1.08,
    "default":             1.10,
  },
};

// Hard floor and ceiling multipliers vs Kroger
const STORE_FLOOR_MULTIPLIER = {
  "Aldi":       0.70,
  "Lidl":       0.72,
  "WinCo":      0.74,
  "Walmart":    0.82,
  "Food Lion":  0.86,
  "Kroger":     1.00,
  "H-E-B":      0.86,
  "Sam's Club": 0.75,
  "Costco":     0.74,
  "Publix":     1.03,
};

const STORE_CEILING_MULTIPLIER = {
  "Aldi":       0.96,
  "Lidl":       0.97,
  "WinCo":      0.98,
  "Walmart":    0.99,
  "Food Lion":  1.02,
  "Kroger":     1.00,
  "H-E-B":      1.02,
  "Sam's Club": 0.97,
  "Costco":     0.97,
  "Publix":     1.25,
};

// Variance ranges — tight to prevent tier-swapping
const STORE_VARIANCE_RANGE = {
  "Aldi":       0.04,
  "Lidl":       0.04,
  "WinCo":      0.04,
  "Walmart":    0.03,
  "Food Lion":  0.03,
  "Kroger":     0.00,
  "H-E-B":      0.03,
  "Sam's Club": 0.04,
  "Costco":     0.04,
  "Publix":     0.03,
};

// Category volatility — high for fresh items, low for stable pantry items
const CATEGORY_VOLATILITY = {
  "Fresh Produce":       1.9,
  "Meat & Seafood":      1.7,
  "Deli":                1.3,
  "Bakery & Bread":      1.2,
  "Dairy & Eggs":        1.0,
  "Frozen":              0.7,
  "Beverages":           0.6,
  "Snacks":              0.6,
  "Breakfast & Cereal":  0.5,
  "Candy":               0.5,
  "Pantry":              0.4,
  "Baking":              0.4,
  "Global Cuisine":      0.8,
  "Alcohol":             0.6,
  "Spices & Seasonings": 0.4,
  "Household":           0.5,
};

// Basket type detection
const BULK_KEYWORDS      = ["bulk", "pack", "case", "gallon", "lb", "pound"];
const ORGANIC_KEYWORDS   = ["organic", "natural", "grass-fed", "free range", "non-gmo"];
const BRAND_KEYWORDS     = ["coca-cola", "pepsi", "kraft", "heinz", "kellogg", "campbell", "tide", "dawn"];
const HOUSEHOLD_KEYWORDS = ["detergent", "soap", "paper towel", "toilet paper", "cleaner", "dish", "laundry"];

function detectBasketType(cartItems) {
  const names      = cartItems.map(i => (i.product?.name || "").toLowerCase()).join(" ");
  const categories = cartItems.map(i => (i.product?.category || "")).join(" ");
  const bulkScore      = BULK_KEYWORDS.filter(k => names.includes(k)).length;
  const organicScore   = ORGANIC_KEYWORDS.filter(k => names.includes(k)).length;
  const brandScore     = BRAND_KEYWORDS.filter(k => names.includes(k)).length;
  const householdScore = HOUSEHOLD_KEYWORDS.filter(k => names.includes(k) || categories.includes(k)).length;
  const meatCount      = cartItems.filter(i => (i.product?.category || "").includes("Meat")).length;
  const frozenCount    = cartItems.filter(i => (i.product?.category || "").includes("Frozen")).length;
  if (bulkScore >= 2 || meatCount >= 3)  return "bulk";
  if (organicScore >= 2)                  return "organic";
  if (brandScore >= 3)                    return "brand_heavy";
  if (householdScore >= 3)               return "household_heavy";
  if (frozenCount >= 3)                  return "frozen_heavy";
  return "standard";
}

const BASKET_TYPE_MODIFIERS = {
  "bulk":           { "Costco": 0.93, "Sam's Club": 0.94, "Aldi": 1.02, "Lidl": 1.02 },
  "organic":        { "Publix": 0.96, "Kroger": 0.97, "Aldi": 1.03, "WinCo": 1.03 },
  "brand_heavy":    { "Walmart": 0.95, "Kroger": 0.97, "Aldi": 1.06, "Lidl": 1.05, "WinCo": 1.04 },
  "household_heavy":{ "Walmart": 0.92, "Costco": 0.90, "Sam's Club": 0.91, "Aldi": 1.02 },
  "frozen_heavy":   { "WinCo": 1.05, "Walmart": 0.96, "Kroger": 0.97 },
  "standard":       {},
};

// Missing item chances — budget/warehouse stores carry fewer SKUs
const STORE_MISSING_CHANCE = {
  "Aldi":       0.18,
  "Lidl":       0.16,
  "WinCo":      0.10,
  "Walmart":    0.04,
  "Food Lion":  0.06,
  "Kroger":     0.00,
  "H-E-B":      0.06,
  "Sam's Club": 0.20,
  "Costco":     0.22,
  "Publix":     0.05,
};

// Kroger category baseline prices (median)
const CATEGORY_BASELINE_PRICES = {
  "Dairy & Eggs":        3.99,
  "Meat & Seafood":      6.99,
  "Fresh Produce":       2.49,
  "Bakery & Bread":      3.29,
  "Pantry":              2.99,
  "Frozen":              4.49,
  "Breakfast & Cereal":  4.99,
  "Snacks":              3.99,
  "Candy":               3.49,
  "Beverages":           3.99,
  "Deli":                7.99,
  "Baking":              2.99,
  "Global Cuisine":      4.49,
  "Alcohol":             9.99,
  "Spices & Seasonings": 3.29,
  "Household":           4.99,
};

export function getKrogerBaseline(product) {
  const known = product.kroger_price ?? product.price;
  if (known && known > 0) return known;
  return CATEGORY_BASELINE_PRICES[product.category] ?? 3.99;
}

function seededVarianceFactor(productId, storeName, category) {
  const today = new Date().toISOString().slice(0, 10);
  const seed = `${productId}::${storeName}::${today}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
    hash = hash >>> 0;
  }
  const normalized    = ((hash % 1000) / 1000) - 0.5;
  const storeRange    = STORE_VARIANCE_RANGE[storeName] ?? 0.03;
  const catVolatility = CATEGORY_VOLATILITY[category] ?? 1.0;
  return 1 + storeRange * catVolatility * normalized * 2;
}

export function estimatePricesForProduct(product) {
  const krogerPrice = getKrogerBaseline(product);
  const category    = product.category ?? "Pantry";
  const productId   = product.id ?? product.barcode ?? product.name ?? "unknown";
  const prices = {};
  for (const store of STORES_ORDERED) {
    if (store === "Kroger") {
      prices[store] = Math.round(krogerPrice * 100) / 100;
      continue;
    }
    const storeMults = STORE_CATEGORY_MULTIPLIERS[store] ?? {};
    const catMult    = storeMults[category] ?? storeMults["default"] ?? 1.0;
    const variance   = seededVarianceFactor(productId, store, category);
    const raw        = krogerPrice * catMult * variance;
    const floor      = krogerPrice * (STORE_FLOOR_MULTIPLIER[store] ?? 0.75);
    const ceiling    = krogerPrice * (STORE_CEILING_MULTIPLIER[store] ?? 1.30);
    prices[store]    = Math.round(Math.min(Math.max(raw, floor), ceiling) * 100) / 100;
  }
  return prices;
}

export function applyPriceBuffer(rawTotal) {
  return {
    low:  Math.round(rawTotal * 1.02 * 100) / 100,
    high: Math.round(rawTotal * 1.06 * 100) / 100,
  };
}

export const ITEM_WEIGHTS = { core: 1.0, standard: 0.5 };
const CORE_ITEMS = new Set([
  "milk","eggs","bread","chicken","ground beef","bananas","apples",
  "rice","pasta","cheese","butter","potatoes","onions","steak","pork",
]);
export function getItemWeight(productName = "") {
  const name = productName.toLowerCase();
  return [...CORE_ITEMS].some(c => name.includes(c)) ? ITEM_WEIGHTS.core : ITEM_WEIGHTS.standard;
}

function isMissingItem(productId, storeName) {
  const today = new Date().toISOString().slice(0, 10);
  const seed = `missing::${productId}::${storeName}::${today}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
    hash = hash >>> 0;
  }
  return ((hash % 1000) / 1000) < (STORE_MISSING_CHANCE[storeName] ?? 0.05);
}

export function compareCartAcrossStores(cartItems) {
  if (!cartItems?.length) return [];
  const basketType      = detectBasketType(cartItems);
  const basketModifiers = BASKET_TYPE_MODIFIERS[basketType] ?? {};
  const storeTotals      = {};
  const storeItems       = {};
  const storeMissingCost = {};
  for (const store of STORES_ORDERED) {
    storeTotals[store]      = 0;
    storeItems[store]       = [];
    storeMissingCost[store] = 0;
  }
  for (const { product, quantity = 1 } of cartItems) {
    const itemPrices  = estimatePricesForProduct(product);
    const krogerPrice = getKrogerBaseline(product);
    const productId   = product.id ?? product.name ?? "unknown";
    for (const store of STORES_ORDERED) {
      const missing = store !== "Kroger" && isMissingItem(productId, store);
      if (missing) {
        const penalty = krogerPrice * 1.20 * quantity;
        storeTotals[store]      += penalty;
        storeMissingCost[store] += penalty;
        storeItems[store].push({ product_name: product.name, estimated_price: krogerPrice * 1.20, quantity, available: false, note: "May not carry" });
      } else {
        const price = itemPrices[store] ?? krogerPrice;
        storeTotals[store] += price * quantity;
        storeItems[store].push({ product_name: product.name, estimated_price: price, quantity, available: true });
      }
    }
  }
  for (const store of STORES_ORDERED) {
    storeTotals[store] = Math.round(storeTotals[store] * (basketModifiers[store] ?? 1.0) * 100) / 100;
  }
  const results = STORES_ORDERED.map(store => {
    const raw = storeTotals[store];
    const range = applyPriceBuffer(raw);
    return {
      name: store, raw_total: raw, total_low: range.low, total_high: range.high,
      items: storeItems[store], items_total: cartItems.length,
      items_available: storeItems[store].filter(i => i.available).length,
      missing_penalty: Math.round(storeMissingCost[store] * 100) / 100,
      basket_type: basketType, data_source: STORE_DATA_SOURCE[store], link: STORE_LINKS[store],
    };
  });
  results.sort((a, b) => a.raw_total - b.raw_total);
  const total = results.length;
  return results.map((r, i) => ({
    ...r,
    tier: i < Math.ceil(total * 0.3) ? "best_value" : i < Math.ceil(total * 0.7) ? "balanced" : "premium",
    savings_vs_most_expensive: Math.round((results[total - 1].raw_total - r.raw_total) * 100) / 100,
  }));
}

export function getProductStorePrices(product) {
  const prices = estimatePricesForProduct(product);
  return STORES_ORDERED
    .map(store => ({ store, price: prices[store] ?? null, is_baseline: store === "Kroger", is_real: STORE_DATA_SOURCE[store] === "real", data_source: STORE_DATA_SOURCE[store] }))
    .sort((a, b) => (a.price ?? 999) - (b.price ?? 999));
}

export function blendWithReceiptData(product, receiptAverages = {}) {
  const estimates = estimatePricesForProduct(product);
  const blended = {};
  for (const store of STORES_ORDERED) {
    const estimated = estimates[store] ?? 0;
    const real = receiptAverages[store] ?? null;
    blended[store] = real !== null && real > 0 ? Math.round((estimated * 0.6 + real * 0.4) * 100) / 100 : estimated;
  }
  return blended;
}
