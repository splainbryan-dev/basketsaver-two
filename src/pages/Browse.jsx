// src/pages/Browse.jsx
// Live grocery product catalog with real prices.
// No zip code needed — loads automatically.

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, TrendingDown, Plus, Minus, Heart,
  ChevronDown, ChevronUp, X, Loader2, Tag,
} from "lucide-react";
import {
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  DEFAULT_STORE_NAME,
  DEFAULT_LOCATION_ID,
} from "@/api/kroger";
import {
  estimatePricesForProduct,
  getProductStorePrices,
  getKrogerBaseline,
} from "@/api/pricingEngine";
import { PRODUCTS, CATEGORIES } from "@/data/products";

const CATEGORY_ICONS = {
  "Dairy & Eggs": "🥛", "Meat & Seafood": "🥩", "Fresh Produce": "🥦",
  "Bakery & Bread": "🍞", Pantry: "🥫", Frozen: "🧊",
  "Breakfast & Cereal": "🥣", Snacks: "🍿", Candy: "🍬",
  Beverages: "🧃", Deli: "🥪", Baking: "🧁",
  International: "🌍", Alcohol: "🍺",
};

// ── Product Card ─────────────────────────────────────────────────
function ProductCard({ product }) {
  const [qty, setQty]               = useState(0);
  const [isFav, setIsFav]           = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [imgError, setImgError]     = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const item = cart.find((i) => i.product_id === product.id);
    setQty(item?.quantity ?? 0);
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFav(favs.includes(product.id));
  }, [product.id]);

  const updateCart = (newQty) => {
    const cart      = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx       = cart.findIndex((i) => i.product_id === product.id);
    const basePrice = getKrogerBaseline(product);

    if (newQty <= 0) {
      if (idx >= 0) cart.splice(idx, 1);
    } else if (idx >= 0) {
      cart[idx].quantity = newQty;
      cart[idx].total    = newQty * basePrice;
    } else {
      cart.push({
        product_id:       product.id,
        product_name:     product.name,
        brand:            product.brand || null,
        price:            basePrice,
        category:         product.category,
        unit:             product.unit || null,
        image_url:        product.image_url || null,
        quantity:         newQty,
        total:            newQty * basePrice,
        estimated_prices: estimatePricesForProduct(product),
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setQty(newQty);
  };

  const toggleFav = (e) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const next = isFav ? favs.filter((id) => id !== product.id) : [...favs, product.id];
    localStorage.setItem("favorites", JSON.stringify(next));
    setIsFav(!isFav);
  };

  const storePrices = getProductStorePrices(product);
  const cheapest    = storePrices[0];
  const mostExp     = storePrices[storePrices.length - 1];
  const basePrice   = getKrogerBaseline(product);

  return (
    <Card className="group relative bg-white border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-200 rounded-2xl overflow-hidden flex flex-col">
      {/* Sale badge */}
      {product.on_sale && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Tag className="w-2.5 h-2.5" /> SALE {product.discount_percentage > 0 ? `-${product.discount_percentage}%` : ""}
        </div>
      )}

      {/* Fav button */}
      <button
        onClick={toggleFav}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
      >
        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
      </button>

      {/* Product image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-2"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-5xl select-none">{CATEGORY_ICONS[product.category] || "🛒"}</span>
        )}
      </div>

      <CardContent className="p-3 flex flex-col flex-1">
        {product.brand && (
          <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mb-0.5 truncate">{product.brand}</p>
        )}
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{product.category}</p>
        <h3 className="font-semibold text-sm text-gray-900 leading-tight mb-1 line-clamp-2 flex-1">{product.name}</h3>
        {product.unit && <p className="text-xs text-gray-400 mb-2">{product.unit}</p>}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-blue-600 font-bold text-base">${basePrice.toFixed(2)}</span>
          {product.on_sale && product.original_price && (
            <span className="text-gray-400 text-xs line-through">${product.original_price.toFixed(2)}</span>
          )}

        </div>

        {/* Price range toggle */}
        <button
          onClick={() => setShowPrices(!showPrices)}
          className="w-full flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 mb-2 hover:bg-blue-50 transition-colors"
        >
          <span>
            <span className="text-green-600 font-semibold">${cheapest?.price?.toFixed(2)}</span>
            {" – "}
            <span className="text-red-400 font-semibold">${mostExp?.price?.toFixed(2)}</span>
            {" "}across 10 stores
          </span>
          {showPrices ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Expanded store prices */}
        {showPrices && (
          <div className="mb-2 border border-gray-100 rounded-xl overflow-hidden">
            {storePrices.map(({ store, price, is_real }, i) => (
              <div
                key={store}
                className={`flex justify-between items-center text-xs py-1.5 px-2 ${
                  i % 2 === 0 ? "bg-gray-50" : "bg-white"
                } ${store === cheapest?.store ? "text-green-700 font-bold" : "text-gray-600"}`}
              >
                <span className="flex items-center gap-1">
                  {i === 0 && <span className="text-green-500">✓</span>}
                  {store}
                  {is_real
                    ? <span className="text-blue-400 text-[9px] bg-blue-50 px-1 rounded ml-1">live</span>
                    : <span className="text-gray-300 text-[9px] ml-1">est.</span>
                  }
                </span>
                <span>${price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cart controls */}
        {qty > 0 ? (
          <div className="flex items-center justify-between mt-auto">
            <button onClick={() => updateCart(0)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <button onClick={() => updateCart(qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100">
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 text-sm font-semibold min-w-[1.5rem] text-center">{qty}</span>
              <button onClick={() => updateCart(qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => updateCart(1)}
            className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-9 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add to Cart
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton loader ──────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <Card className="rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-9 w-full rounded-full mt-2" />
      </div>
    </Card>
  );
}

// ── Cart banner ──────────────────────────────────────────────────
function CartBanner({ navigate }) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCount(cart.reduce((s, i) => s + i.quantity, 0));
      setTotal(cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0));
    };
    update();
    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 z-40 max-w-lg mx-auto">
      <button
        onClick={() => navigate(createPageUrl("Cart"))}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">{count}</div>
          <div className="text-left">
            <p className="font-semibold text-sm">View Cart & Compare</p>
            <p className="text-blue-200 text-xs">Find the cheapest store</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">${total.toFixed(2)}</p>

        </div>
      </button>
    </div>
  );
}

// Rotating search terms for "All" category Load More — keeps results fresh
const ALL_BROWSE_TERMS = [
  "chicken", "milk", "bread", "eggs", "apples", "snacks",
  "pasta", "cereal", "juice", "chips", "yogurt", "butter",
  "beef", "salmon", "cheese", "rice", "soup", "coffee",
  "frozen meals", "cookies", "soda", "pork", "shrimp", "salad",
];

// ── Main Browse page ─────────────────────────────────────────────
export default function Browse() {
  const navigate = useNavigate();
  const [products, setProducts]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [loadingMore, setLoadingMore]           = useState(false);
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasMore, setHasMore]                   = useState(false);
  const [apiError, setApiError]                 = useState(false);
  const [termIndex, setTermIndex]               = useState(0);
  const [seenIds, setSeenIds]                   = useState(new Set());
  const searchTimeout                           = useRef(null);

  const loadProducts = useCallback(async (term, category, append = false, currentTermIndex = 0, currentSeenIds = new Set()) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setApiError(false);

    try {
      let result = [];
      let more = false;

      if (term && term.trim().length > 1) {
        result = await searchProducts(term, null, 50);
        more = false;
      } else if (category !== "all") {
        // Category mode — paginate through terms with offset
        const { products, hasMore } = await getProductsByCategory(category, null, 50, currentTermIndex);
        result = products.filter((p) => !currentSeenIds.has(p.id));
        more = hasMore;
        setTermIndex(currentTermIndex + 3);
      } else {
        // "All" browse mode — rotate through terms
        const browseTerm = ALL_BROWSE_TERMS[currentTermIndex % ALL_BROWSE_TERMS.length];
        const raw = await searchProducts(browseTerm, null, 50);
        result = raw.filter((p) => !currentSeenIds.has(p.id));
        const nextIndex = currentTermIndex + 1;
        setTermIndex(nextIndex);
        more = nextIndex < ALL_BROWSE_TERMS.length;
      }

      if (result.length === 0 && !append) {
        const local = PRODUCTS.filter((p) =>
          (category === "all" || p.category === category) &&
          (!term || p.name.toLowerCase().includes(term.toLowerCase()))
        );
        setProducts(local);
        setHasMore(false);
      } else {
        const newIds = new Set([...currentSeenIds, ...result.map((p) => p.id)]);
        setSeenIds(newIds);
        setProducts((prev) => append ? [...prev, ...result] : result);
        setHasMore(more);
      }
    } catch (err) {
      console.error("Product load error:", err);
      const local = PRODUCTS.filter((p) =>
        category === "all" || p.category === category
      );
      setProducts(local);
      setHasMore(false);
      setApiError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Debounced search/category change — reset term rotation
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    const delay = searchTerm ? 400 : 0;
    searchTimeout.current = setTimeout(() => {
      setTermIndex(0);
      setSeenIds(new Set());
      loadProducts(searchTerm, selectedCategory, false, 0, new Set());
    }, delay);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, selectedCategory, loadProducts]);

  return (
    <div className="min-h-screen bg-gray-50 pb-48 md:pb-10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Hero */}
        <div className="relative mb-4 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-6">
          <div className="relative z-10">
            <h1 className="text-base md:text-2xl font-bold text-white mb-1">
              Compare Grocery Prices Across 10 Stores
            </h1>
            <p className="text-blue-100 text-xs md:text-sm">
              Search any product to see prices at Walmart, Costco, Target, Aldi & more
            </p>
          </div>
          <TrendingDown className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 text-white/10 hidden md:block" />
        </div>

        {/* API error notice */}
        {false && apiError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>Showing local products — check your Kroger API credentials in .env</span>
          </div>
        )}

        {/* Search — primary action */}
        <div className="mb-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder='Search products... (e.g. "chicken breast", "oreos", "whole milk")'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-24 h-13 rounded-full border-2 border-blue-200 shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white text-sm md:text-base"
            autoFocus={false}
          />
          {searchTerm ? (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-300 hidden md:block">
              Press Enter
            </span>
          )}
        </div>

        {/* Quick search suggestions — shown when no search active */}
        {!searchTerm && selectedCategory === "all" && (
          <div className="mb-4 flex flex-wrap gap-2">
            {["chicken breast", "whole milk", "eggs", "ground beef", "bread", "salmon", "shrimp", "ribeye steak", "bacon", "cheese"].map((s) => (
              <button
                key={s}
                onClick={() => setSearchTerm(s)}
                className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Category pills — horizontal scroll slider */}
        <div className="mb-6 relative -mx-4 md:mx-0">
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none md:hidden" />
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none md:hidden" />
          <div
            className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 md:flex-wrap"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setSelectedCategory(cat.value); setSearchTerm(""); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {searchTerm
              ? `Results for "${searchTerm}"`
              : selectedCategory === "all"
              ? "Featured Products"
              : CATEGORIES.find((c) => c.value === selectedCategory)?.label}
          </h2>
          {!loading && products.length > 0 && (
            <span className="text-sm text-gray-400">{products.length} items</span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => loadProducts(searchTerm, selectedCategory, true, termIndex, seenIds)}
                  disabled={loadingMore}
                  className="bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingMore
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                    : "Load More Products"
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CartBanner navigate={navigate} />
    </div>
  );
}
