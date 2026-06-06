// src/pages/Browse.jsx
// BasketSaver v2 — Deals-first home page
// Hero: Weekly Deals (Kroger real sale data) + Price Drops + Coupons
// Secondary: Product catalog with search + categories

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Plus, Minus, Heart, ChevronDown, ChevronUp,
  X, Loader2, Tag, Flame, TrendingDown, Bell, Ticket,
  ShoppingCart, ChevronRight,
} from "lucide-react";
import {
  searchProducts, getProductsByCategory, getFeaturedProducts,
} from "@/api/kroger";
import {
  estimatePricesForProduct, getProductStorePrices, getKrogerBaseline,
} from "@/api/pricingEngine";
import { PRODUCTS, CATEGORIES } from "@/data/products";

const CATEGORY_ICONS = {
  "Dairy & Eggs": "🥛", "Meat & Seafood": "🥩", "Fresh Produce": "🥦",
  "Bakery & Bread": "🍞", Pantry: "🥫", Frozen: "🧊",
  "Breakfast & Cereal": "🥣", Snacks: "🍿", Candy: "🍬",
  Beverages: "🧃", Deli: "🥪", Baking: "🧁",
  International: "🌍", Alcohol: "🍺",
};

// Deal tabs
const DEAL_TABS = [
  { id: "hot",   label: "🔥 Deals",        icon: Flame },
  { id: "drops", label: "💸 Price Drops",  icon: TrendingDown },
  { id: "coupon",label: "🎟 Coupons",      icon: Ticket },
];

// ── Deal Card ─────────────────────────────────────────────────────
function DealCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const basePrice    = getKrogerBaseline(product);
  const savings      = product.original_price ? product.original_price - basePrice : 0;
  const pctOff       = product.discount_percentage || (product.original_price ? Math.round((savings / product.original_price) * 100) : 0);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex-shrink-0 w-44 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* Sale badge */}
      <div className="relative">
        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-2" loading="lazy" />
          ) : (
            <span className="text-4xl">{CATEGORY_ICONS[product.category] || "🛒"}</span>
          )}
        </div>
        {pctOff > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
            -{pctOff}%
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[10px] text-gray-400 truncate">{product.category}</p>
        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1.5">{product.name}</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-blue-600 font-bold text-sm">${basePrice.toFixed(2)}</span>
          {product.original_price && (
            <span className="text-gray-400 text-[10px] line-through">${product.original_price.toFixed(2)}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          className={`w-full h-7 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
            added ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {added ? "✓ Added" : <><Plus className="w-3 h-3" /> Add</>}
        </button>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────
function ProductCard({ product }) {
  const [qty, setQty]               = useState(0);
  const [isFav, setIsFav]           = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [imgError, setImgError]     = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const item = cart.find(i => i.product_id === product.id);
    setQty(item?.quantity ?? 0);
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFav(favs.includes(product.id));
  }, [product.id]);

  const updateCart = (newQty) => {
    const cart      = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx       = cart.findIndex(i => i.product_id === product.id);
    const basePrice = getKrogerBaseline(product);
    if (newQty <= 0) {
      if (idx >= 0) cart.splice(idx, 1);
    } else if (idx >= 0) {
      cart[idx].quantity = newQty;
      cart[idx].total    = newQty * basePrice;
    } else {
      cart.push({
        product_id: product.id, product_name: product.name,
        brand: product.brand || null, price: basePrice,
        category: product.category, unit: product.unit || null,
        image_url: product.image_url || null, quantity: newQty,
        total: newQty * basePrice,
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
    const next = isFav ? favs.filter(id => id !== product.id) : [...favs, product.id];
    localStorage.setItem("favorites", JSON.stringify(next));
    setIsFav(!isFav);
  };

  const storePrices = getProductStorePrices(product);
  const cheapest    = storePrices[0];
  const mostExp     = storePrices[storePrices.length - 1];
  const basePrice   = getKrogerBaseline(product);

  return (
    <Card className="group relative bg-white border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-200 rounded-2xl overflow-hidden flex flex-col">
      {product.on_sale && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Tag className="w-2.5 h-2.5" /> SALE {product.discount_percentage > 0 ? `-${product.discount_percentage}%` : ""}
        </div>
      )}
      <button onClick={toggleFav} className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
      </button>
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.image_url && !imgError ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-2" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <span className="text-5xl select-none">{CATEGORY_ICONS[product.category] || "🛒"}</span>
        )}
      </div>
      <CardContent className="p-3 flex flex-col flex-1">
        {product.brand && <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mb-0.5 truncate">{product.brand}</p>}
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{product.category}</p>
        <h3 className="font-semibold text-sm text-gray-900 leading-tight mb-1 line-clamp-2 flex-1">{product.name}</h3>
        {product.unit && <p className="text-xs text-gray-400 mb-2">{product.unit}</p>}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-blue-600 font-bold text-base">${basePrice.toFixed(2)}</span>
          {product.on_sale && product.original_price && (
            <span className="text-gray-400 text-xs line-through">${product.original_price.toFixed(2)}</span>
          )}
        </div>
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
        {showPrices && (
          <div className="mb-2 border border-gray-100 rounded-xl overflow-hidden">
            {storePrices.map(({ store, price, is_real }, i) => (
              <div key={store} className={`flex justify-between items-center text-xs py-1.5 px-2 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} ${store === cheapest?.store ? "text-green-700 font-bold" : "text-gray-600"}`}>
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
        {qty > 0 ? (
          <div className="flex items-center justify-between mt-auto">
            <button onClick={() => updateCart(0)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <button onClick={() => updateCart(qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
              <span className="px-2 text-sm font-semibold min-w-[1.5rem] text-center">{qty}</span>
              <button onClick={() => updateCart(qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
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

const ALL_BROWSE_TERMS = [
  "chicken", "milk", "bread", "eggs", "apples", "snacks",
  "pasta", "cereal", "juice", "chips", "yogurt", "butter",
  "beef", "salmon", "cheese", "rice", "soup", "coffee",
  "frozen meals", "cookies", "soda", "pork", "shrimp", "salad",
];

// ── Main Browse ───────────────────────────────────────────────────
export default function Browse() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]               = useState("hot");
  const [dealProducts, setDealProducts]         = useState([]);
  const [dealsLoading, setDealsLoading]         = useState(true);
  const [products, setProducts]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [loadingMore, setLoadingMore]           = useState(false);
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasMore, setHasMore]                   = useState(false);
  const [termIndex, setTermIndex]               = useState(0);
  const [seenIds, setSeenIds]                   = useState(new Set());
  const [cartCount, setCartCount]               = useState(0);
  const searchTimeout                           = useRef(null);
  const searchInputRef                          = useRef(null);
  const pageTopRef                              = useRef(null);
  const isSearching                             = searchTerm.length > 0 || selectedCategory !== "all";

  // Cart count
  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    update();
    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  // Load deals from Kroger API (on_sale items)
  useEffect(() => {
    const loadDeals = async () => {
      setDealsLoading(true);
      try {
        const terms = ["meat", "chicken", "beef", "milk", "eggs", "bread", "seafood", "produce"];
        const results = await Promise.all(terms.map(t => searchProducts(t, null, 20)));
        const all = results.flat();
        const onSale = all.filter(p => p.on_sale);
        // Deduplicate
        const seen = new Set();
        const unique = onSale.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
        setDealProducts(unique.slice(0, 30));
      } catch {
        setDealProducts([]);
      } finally {
        setDealsLoading(false);
      }
    };
    loadDeals();
  }, []);

  const addToCart = (product) => {
    const cart      = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx       = cart.findIndex(i => i.product_id === product.id);
    const basePrice = getKrogerBaseline(product);
    if (idx >= 0) {
      cart[idx].quantity += 1;
      cart[idx].total = cart[idx].quantity * basePrice;
    } else {
      cart.push({
        product_id: product.id, product_name: product.name,
        brand: product.brand || null, price: basePrice,
        category: product.category, unit: product.unit || null,
        image_url: product.image_url || null, quantity: 1,
        total: basePrice, estimated_prices: estimatePricesForProduct(product),
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const loadProducts = useCallback(async (term, category, append = false, currentTermIndex = 0, currentSeenIds = new Set()) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      let result = [], more = false;
      if (term && term.trim().length > 1) {
        const raw = await searchProducts(term, null, 50);
        const t = term.toLowerCase().trim();
        result = raw.sort((a, b) => {
          const an = (a.name || "").toLowerCase(), bn = (b.name || "").toLowerCase();
          const aE = an === t ? 0 : an.startsWith(t) ? 1 : 3;
          const bE = bn === t ? 0 : bn.startsWith(t) ? 1 : 3;
          return aE - bE;
        });
        more = false;
      } else if (category !== "all") {
        const { products: p } = await getProductsByCategory(category, null, 50, currentTermIndex);
        result = p.filter(pr => !currentSeenIds.has(pr.id));
        more = true;
        setTermIndex(currentTermIndex + 3);
      } else {
        const browseTerm = ALL_BROWSE_TERMS[currentTermIndex % ALL_BROWSE_TERMS.length];
        const raw = await searchProducts(browseTerm, null, 50);
        result = raw.filter(p => !currentSeenIds.has(p.id));
        setTermIndex(currentTermIndex + 1);
        more = (currentTermIndex + 1) < ALL_BROWSE_TERMS.length;
      }
      if (result.length === 0 && !append) {
        setProducts(PRODUCTS.filter(p => category === "all" || p.category === category));
        setHasMore(false);
      } else {
        const newIds = new Set([...currentSeenIds, ...result.map(p => p.id)]);
        setSeenIds(newIds);
        setProducts(prev => append ? [...prev, ...result] : result);
        setHasMore(more);
      }
    } catch {
      setProducts(PRODUCTS.filter(p => category === "all" || p.category === category));
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => pageTopRef.current?.scrollIntoView({ behavior: "smooth" });
    window.addEventListener("browseScrollTop", handler);
    return () => window.removeEventListener("browseScrollTop", handler);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    const delay = searchTerm ? 400 : 0;
    searchTimeout.current = setTimeout(() => {
      setTermIndex(0); setSeenIds(new Set());
      loadProducts(searchTerm, selectedCategory, false, 0, new Set());
    }, delay);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, selectedCategory, loadProducts]);

  // Filter deal products by tab
  const filteredDeals = dealProducts.filter(p => {
    if (activeTab === "hot")    return p.on_sale && (p.discount_percentage >= 15 || p.original_price);
    if (activeTab === "drops")  return p.on_sale && p.discount_percentage > 0;
    if (activeTab === "coupon") return p.on_sale;
    return true;
  });

  return (
    <div ref={pageTopRef} className="min-h-screen bg-gray-50 pb-64 md:pb-10">
      <div className="container mx-auto px-4 py-4 max-w-7xl">

        {/* ── Deal Alert Banner ── */}
        {!isSearching && (
          <div className="mb-4">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base leading-none">This Week's Deals</h2>
                  <p className="text-xs text-gray-400">Updated daily from Kroger</p>
                </div>
              </div>
              <button
                onClick={() => navigate(createPageUrl("Cart"))}
                className="relative flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Deal tabs */}
            <div className="flex gap-2 mb-3">
              {DEAL_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Deal products horizontal scroll */}
            {dealsLoading ? (
              <div className="flex gap-3 overflow-x-hidden">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-white border border-gray-100">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-2.5 space-y-1.5">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-7 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDeals.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {filteredDeals.map(product => (
                  <DealCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <Flame className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No deals found right now — check back tomorrow!</p>
              </div>
            )}

            {/* Divider before catalog */}
            <div className="mt-4 mb-2 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">Browse All Products</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
        )}

        {/* ── Search ── */}
        <div className="mb-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder='Search products... (e.g. "chicken breast", "whole milk")'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); searchInputRef.current?.blur(); } }}
            className="pl-11 pr-10 h-12 rounded-full border-2 border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white text-sm"
            autoFocus={false}
          />
          {searchTerm ? (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Quick search chips */}
        {!searchTerm && selectedCategory === "all" && (
          <div className="mb-4 flex flex-wrap gap-2">
            {["chicken breast", "whole milk", "eggs", "ground beef", "bread", "salmon", "shrimp", "ribeye steak", "bacon", "cheese"].map(s => (
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

        {/* Category pills */}
        <div className="mb-5 relative -mx-4 md:mx-0">
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none md:hidden" />
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none md:hidden" />
          <div
            className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 md:flex-wrap"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORIES.map(cat => (
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
          <h2 className="text-base font-bold text-gray-900">
            {searchTerm
              ? `Results for "${searchTerm}"`
              : selectedCategory === "all"
              ? "All Products"
              : CATEGORIES.find(c => c.value === selectedCategory)?.label}
          </h2>
          {!loading && products.length > 0 && (
            <span className="text-sm text-gray-400">{products.length} items</span>
          )}
        </div>

        {/* Product grid */}
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
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8 mb-16">
                <button
                  onClick={() => loadProducts(searchTerm, selectedCategory, true, termIndex, seenIds)}
                  disabled={loadingMore}
                  className="bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : "Load More Products"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
