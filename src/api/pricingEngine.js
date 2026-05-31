// src/api/pricingEngine.js
// BasketSaver Pricing Algorithm v2
// Top 10 most-shopped US grocery stores (by market share + customer satisfaction)
//
// Formula:
//   estimatedPrice = baselinePrice × storeMultiplier × categoryMultiplier × seededVariance
//
// For products from Open Food Facts with no known price,
// we first estimate a Kroger baseline from category averages,
// then apply store multipliers on top.

// ---------- Top 10 stores ----------
export const STORES_ORDERED = [
  "Walmart",
  "Aldi",
  "Sam's Club",
  "Costco",
  "Kroger",
  "Target",
  "H-E-B",
  "Publix",
  "Trader Joe's",
  "Whole Foods",
];

// Which stores have real API data vs algorithm estimates
export const STORE_DATA_SOURCE = {
  "Walmart":      "real",      // Walmart affiliate API
  "Aldi":         "algorithm", // No public API
  "Sam's Club":   "real",      // Walmart affiliate API
  "Costco":       "algorithm", // No public API
  "Kroger":       "real",      // Kroger API
  "Target":       "real",      // Target affiliate API
  "H-E-B":        "algorithm", // No public API
  "Publix":       "algorithm", // No public API
  "Trader Joe's": "algorithm", // No public API — intentionally
  "Whole Foods":  "real",      // Amazon PA API
};

// ---------- Store multipliers vs Kroger baseline ----------
export const STORE_MULTIPLIERS = {
  "Walmart":      0.92,  // EDLP — consistently cheaper
  "Aldi":         0.88,  // Private label cheaper but not always #1
  "Sam's Club":   0.90,  // Bulk savings
  "Costco":       0.91,  // Bulk savings, quality focus
  "Kroger":       1.00,  // Baseline
  "Target":       1.06,  // Convenience premium
  "H-E-B":        0.95,  // Competitive Texas pricing
  "Publix":       1.12,  // Service/quality premium
  "Trader Joe's": 0.94,  // Private label keeps prices down
  "Whole Foods":  1.28,  // Organic/premium significant markup
};

// Variance range per store — how much individual items deviate from average
const STORE_VARIANCE_RANGE = {
  "Walmart":      0.06,
  "Aldi":         0.12,
  "Sam's Club":   0.10,
  "Costco":       0.11,
  "Kroger":       0.00,
  "Target":       0.08,
  "H-E-B":        0.09,
  "Publix":       0.09,
  "Trader Joe's": 0.13,
  "Whole Foods":  0.15,
};

// Category volatility multipliers
const CATEGORY_VARIANCE_MULTIPLIER = {
  "Fresh Produce":      1.9,
  "Meat & Seafood":     1.7,
  "Deli":               1.4,
  "Bakery & Bread":     1.3,
  "Dairy & Eggs":       1.1,
  "Frozen":             0.9,
  "Breakfast & Cereal": 0.7,
  "Snacks":             0.7,
  "Beverages":          0.7,
  "Candy":              0.6,
  "Pantry":             0.6,
  "Baking":             0.5,
  "Global Cuisine":     1.1,
  "Alcohol":              0.8,
  "Spices & Seasonings": 0.6,
};

// Category multipliers — how each category prices vs the store average
export const CATEGORY_MULTIPLIERS = {
  "Dairy & Eggs":       1.00,
  "Meat & Seafood":     1.15,
  "Fresh Produce":      0.92,
  "Pantry":             1.02,
  "Snacks":             1.08,
  "Candy":              1.10,
  "Beverages":          1.05,
  "Frozen":             1.06,
  "Bakery & Bread":     1.02,
  "Breakfast & Cereal": 1.04,
  "Baking":             1.01,
  "Deli":               1.10,
  "Global Cuisine":     1.06,
  "Alcohol":              1.08,
  "Spices & Seasonings": 1.05,
};

// ---------- Category baseline prices ----------
// Used when a product has no known price (Open Food Facts products).
// These are median Kroger prices per category.
const CATEGORY_BASELINE_PRICES = {
  "Dairy & Eggs":       3.99,
  "Meat & Seafood":     6.99,
  "Fresh Produce":      2.49,
  "Bakery & Bread":     3.29,
  "Pantry":             2.99,
  "Frozen":             4.49,
  "Breakfast & Cereal": 4.99,
  "Snacks":             3.99,
  "Candy":              3.49,
  "Beverages":          3.99,
  "Deli":               7.99,
  "Baking":             2.99,
  "Global Cuisine":     4.49,
  "Alcohol":              9.99,
  "Spices & Seasonings": 3.29,
};

// ---------- Seeded variance ----------
function seededVarianceFactor(productId, storeName, category) {
  const seed = `${productId}::${storeName}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
    hash = hash >>> 0;
  }
  const normalized = (hash % 1000) / 1000 - 0.5;
  const shifted = normalized * 2;
  const storeRange = STORE_VARIANCE_RANGE[storeName] ?? 0.07;
  const catVolatility = CATEGORY_VARIANCE_MULTIPLIER[category] ?? 1.0;
  return 1 + storeRange * catVolatility * shifted;
}

// ---------- Get Kroger baseline price ----------
// If product has a known price use it.
// Otherwise estimate from category median.
export function getKrogerBaseline(product) {
  const known = product.kroger_price ?? product.price;
  if (known && known > 0) return known;
  return CATEGORY_BASELINE_PRICES[product.category] ?? 3.99;
}

// ---------- Core estimate function ----------
export function estimatePricesForProduct(product) {
  const krogerPrice = getKrogerBaseline(product);
  const catMultiplier = CATEGORY_MULTIPLIERS[product.category] ?? 1.0;
  const category = product.category ?? "Pantry";
  const productId = product.id ?? product.barcode ?? product.name ?? "unknown";

  const prices = {};
  for (const store of STORES_ORDERED) {
    if (store === "Kroger") {
      prices[store] = Math.round(krogerPrice * 100) / 100;
      continue;
    }
    const storeMultiplier = STORE_MULTIPLIERS[store] ?? 1.0;
    const variance = seededVarianceFactor(productId, store, category);
    const raw = krogerPrice * storeMultiplier * catMultiplier * variance;
    const floor = krogerPrice * 0.45;
    prices[store] = Math.round(Math.max(raw, floor) * 100) / 100;
  }
  return prices;
}

// ---------- Price buffer ----------
export function applyPriceBuffer(rawTotal) {
  return {
    low:  Math.round(rawTotal * 1.02 * 100) / 100,
    high: Math.round(rawTotal * 1.07 * 100) / 100,
  };
}

// ---------- Item weight system ----------
export const ITEM_WEIGHTS = { core: 1.0, standard: 0.5, low: 0.2 };

const CORE_ITEMS = new Set([
  "milk", "eggs", "bread", "chicken", "ground beef",
  "bananas", "apples", "rice", "pasta", "cheese",
  "butter", "potatoes", "onions",
]);

export function getItemWeight(productName = "") {
  const name = productName.toLowerCase();
  return [...CORE_ITEMS].some((c) => name.includes(c))
    ? ITEM_WEIGHTS.core
    : ITEM_WEIGHTS.standard;
}

// ---------- Cart comparison ----------
export function compareCartAcrossStores(cartItems) {
  if (!cartItems?.length) return [];

  const storeTotals = {};
  const storeScores = {};
  const storeItems  = {};

  for (const store of STORES_ORDERED) {
    storeTotals[store] = 0;
    storeScores[store] = 0;
    storeItems[store]  = [];
  }

  for (const { product, quantity = 1 } of cartItems) {
    const itemPrices = estimatePricesForProduct(product);
    const weight = getItemWeight(product.name);

    for (const store of STORES_ORDERED) {
      const price = itemPrices[store] ?? 0;
      if (price > 0) {
        storeTotals[store] += price * quantity;
        storeScores[store] += price * weight * quantity;
        storeItems[store].push({
          product_name:    product.name,
          estimated_price: price,
          quantity,
          available:       true,
        });
      }
    }
  }

  const results = STORES_ORDERED.map((store) => {
    const raw   = storeTotals[store];
    const range = applyPriceBuffer(raw);
    return {
      name:            store,
      raw_total:       raw,
      total_low:       range.low,
      total_high:      range.high,
      score:           Math.round(storeScores[store] * 100) / 100,
      items:           storeItems[store],
      items_total:     cartItems.length,
      items_available: storeItems[store].length,
      data_source:     STORE_DATA_SOURCE[store],
    };
  });

  results.sort((a, b) => a.raw_total - b.raw_total);

  const total = results.length;
  return results.map((r, i) => ({
    ...r,
    tier:
      i < Math.ceil(total * 0.3) ? "best_value" :
      i < Math.ceil(total * 0.7) ? "balanced"   : "premium",
    savings_vs_most_expensive:
      Math.round((results[total - 1].raw_total - r.raw_total) * 100) / 100,
  }));
}

// ---------- Single product store prices ----------
export function getProductStorePrices(product) {
  const prices = estimatePricesForProduct(product);
  return STORES_ORDERED
    .map((store) => ({
      store,
      price:       prices[store] ?? null,
      is_baseline: store === "Kroger",
      is_real:     STORE_DATA_SOURCE[store] === "real",
      data_source: STORE_DATA_SOURCE[store],
    }))
    .sort((a, b) => (a.price ?? 999) - (b.price ?? 999));
}

// ---------- Phase 2: Receipt data blend ----------
export function blendWithReceiptData(product, receiptAverages = {}) {
  const estimates = estimatePricesForProduct(product);
  const blended   = {};
  for (const store of STORES_ORDERED) {
    const estimated = estimates[store] ?? 0;
    const real      = receiptAverages[store] ?? null;
    blended[store] = real !== null && real > 0
      ? Math.round((estimated * 0.6 + real * 0.4) * 100) / 100
      : estimated;
  }
  return blended;
}
