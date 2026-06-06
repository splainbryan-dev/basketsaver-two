// src/api/pricingEngine.js
// BasketSaver Pricing Algorithm v5
// Store lineup: Walmart, Target, Aldi, Kroger, Albertsons, Publix, Meijer, H-E-B, Food Lion, Lidl
// Profit-optimized: Walmart + Kroger + Target = affiliate revenue. Kroger = real API baseline.
// Kroger = real price baseline (from API). All others = algorithm estimates.
//
// Formula:
//   Item Estimate = Kroger Price × Store Category Multiplier × Daily Seeded Variance
//   Store Total = Σ Item Estimates + Missing Item Penalties
//   Final Total = Store Total × Basket Type Modifier

export const STORES_ORDERED = [
  "Aldi",
  "Walmart",
  "Lidl",
  "Target",
  "Kroger",
  "Albertsons",
  "Meijer",
  "Food Lion",
  "H-E-B",
  "Publix",
];

export const STORE_DATA_SOURCE = {
  "Aldi":        "algorithm",
  "Walmart":     "algorithm",
  "Lidl":        "algorithm",
  "Target":      "algorithm",
  "Kroger":      "real",
  "Albertsons":  "algorithm",
  "Meijer":      "algorithm",
  "Food Lion":   "algorithm",
  "H-E-B":       "algorithm",
  "Publix":      "algorithm",
};

export const STORE_LINKS = {
  "Aldi":       "https://www.aldi.us",
  "Walmart":    "https://www.walmart.com/grocery",
  "Lidl":       "https://www.lidl.com",
  "Target":     "https://www.target.com/c/grocery/-/N-5xt1a",
  "Kroger":     "https://www.kroger.com",
  "Albertsons": "https://www.albertsons.com",
  "Meijer":     "https://www.meijer.com",
  "Food Lion":  "https://www.foodlion.com",
  "H-E-B":      "https://www.heb.com",
  "Publix":     "https://www.publix.com",
};

// Per-store, per-category multipliers vs Kroger = 1.00
// Profit stores: Walmart (affiliate approved), Target (affiliate), Kroger (real API)
// Albertsons covers entire West Coast gap
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
  "Target": {
    "Dairy & Eggs":        1.04,
    "Meat & Seafood":      1.06,
    "Fresh Produce":       1.05,
    "Pantry":              1.03,
    "Snacks":              1.05,
    "Candy":               1.04,
    "Beverages":           1.05,
    "Frozen":              1.06,
    "Bakery & Bread":      1.06,
    "Breakfast & Cereal":  1.04,
    "Baking":              1.03,
    "Deli":                1.07,
    "Global Cuisine":      1.05,
    "Alcohol":             1.06,
    "Spices & Seasonings": 1.04,
    "Household":           1.02,
    "default":             1.05,
  },
  "Kroger": {
    "default": 1.00,
  },
  "Albertsons": {
    "Dairy & Eggs":        1.02,
    "Meat & Seafood":      1.04,
    "Fresh Produce":       1.03,
    "Pantry":              1.01,
    "Snacks":              1.03,
    "Candy":               1.02,
    "Beverages":           1.02,
    "Frozen":              1.03,
    "Bakery & Bread":      1.03,
    "Breakfast & Cereal":  1.02,
    "Baking":              1.01,
    "Deli":                1.04,
    "Global Cuisine":      1.02,
    "Alcohol":             1.03,
    "Spices & Seasonings": 1.02,
    "Household":           1.01,
    "default":             1.02,
  },
  "Meijer": {
    "Dairy & Eggs":        0.96,
    "Meat & Seafood":      0.97,
    "Fresh Produce":       0.96,
    "Pantry":              0.94,
    "Snacks":              0.96,
    "Candy":               0.95,
    "Beverages":           0.95,
    "Frozen":              0.96,
    "Bakery & Bread":      0.96,
    "Breakfast & Cereal":  0.95,
    "Baking":              0.94,
    "Deli":                0.97,
    "Global Cuisine":      0.96,
    "Alcohol":             0.96,
    "Spices & Seasonings": 0.95,
    "Household":           0.93,
    "default":             0.96,
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
// Hard floor and ceiling multipliers vs Kroger
const STORE_FLOOR_MULTIPLIER = {
  "Aldi":        0.70,
  "Walmart":     0.82,
  "Lidl":        0.72,
  "Target":      0.94,
  "Kroger":      1.00,
  "Albertsons":  0.93,
  "Meijer":      0.87,
  "Food Lion":   0.86,
  "H-E-B":       0.86,
  "Publix":      1.03,
};

const STORE_CEILING_MULTIPLIER = {
  "Aldi":        0.94,
  "Walmart":     0.98,
  "Lidl":        0.95,
  "Target":      1.12,
  "Kroger":      1.00,
  "Albertsons":  1.10,
  "Meijer":      1.02,
  "Food Lion":   1.02,
  "H-E-B":       1.02,
  "Publix":      1.25,
};

// Variance ranges — tight to prevent tier-swapping
const STORE_VARIANCE_RANGE = {
  "Aldi":        0.04,
  "Walmart":     0.03,
  "Lidl":        0.04,
  "Target":      0.03,
  "Kroger":      0.00,
  "Albertsons":  0.03,
  "Meijer":      0.03,
  "Food Lion":   0.03,
  "H-E-B":       0.03,
  "Publix":      0.03,
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
  "bulk":           { "Meijer": 0.94, "Walmart": 0.95, "Aldi": 1.02, "Lidl": 1.02 },
  "organic":        { "Publix": 0.96, "Kroger": 0.97, "Albertsons": 0.97, "Aldi": 1.03 },
  "brand_heavy":    { "Walmart": 0.95, "Kroger": 0.97, "Target": 0.98, "Aldi": 1.06, "Lidl": 1.05 },
  "household_heavy":{ "Walmart": 0.92, "Target": 0.95, "Meijer": 0.94, "Aldi": 1.02 },
  "frozen_heavy":   { "Walmart": 0.95, "Kroger": 0.97, "Target": 0.96 },
  "standard":       {},
};

// Missing item chances — budget/warehouse stores carry fewer SKUs
const STORE_MISSING_CHANCE = {
  "Aldi":        0.18,
  "Walmart":     0.03,
  "Lidl":        0.15,
  "Target":      0.08,
  "Kroger":      0.00,
  "Albertsons":  0.05,
  "Meijer":      0.05,
  "Food Lion":   0.06,
  "H-E-B":       0.06,
  "Publix":      0.05,
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
  // Use original_price as baseline for comparison (sale price is Kroger-specific discount)
  // This prevents sale items from artificially lowering all store estimates
  const known = product.original_price ?? product.kroger_price ?? product.price;
  if (known && known > 0) return known;
  return CATEGORY_BASELINE_PRICES[product.category] ?? 3.99;
}

export function getKrogerSalePrice(product) {
  // Actual price the user pays at Kroger (may be on sale)
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
    const krogerSalePrice = getKrogerSalePrice(product);
    const productId   = product.id ?? product.name ?? "unknown";
    for (const store of STORES_ORDERED) {
      const missing = store !== "Kroger" && isMissingItem(productId, store);
      if (missing) {
        const penalty = krogerPrice * 1.20 * quantity;
        storeTotals[store]      += penalty;
        storeMissingCost[store] += penalty;
        storeItems[store].push({ product_name: product.name, estimated_price: krogerPrice * 1.20, quantity, available: false, note: "May not carry" });
      } else {
        // Use actual sale price for Kroger, estimated price for others
        const price = store === "Kroger" ? krogerSalePrice : (itemPrices[store] ?? krogerPrice);
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
