// src/pages/Cart.jsx
// Shopping cart — bridge between Browse and PriceComparison.
// Cart format: { product_id, product_name, price, image_url, unit, category,
//               quantity, total, estimated_prices }
// All stored in localStorage key "cart".

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  TrendingDown,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Save,
  X,
} from "lucide-react";

const CATEGORY_ICONS = {
  "Dairy & Eggs":       "🥛",
  "Meat & Seafood":     "🥩",
  "Fresh Produce":      "🥦",
  "Bakery & Bread":     "🍞",
  Pantry:               "🥫",
  Frozen:               "🧊",
  "Breakfast & Cereal": "🥣",
  Snacks:               "🍿",
  Beverages:            "🧃",
  Deli:                 "🥪",
  Candy:                "🍬",
  Baking:               "🧁",
  Alcohol:              "🍺",
  International:        "🌍",
};

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [listName, setListName] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  const loadCart = () => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  };

  const writeCart = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQty = (productId, delta) => {
    const next = cart
      .map((i) =>
        i.product_id === productId
          ? { ...i, quantity: Math.max(0, i.quantity + delta), total: Math.max(0, i.quantity + delta) * i.price }
          : i
      )
      .filter((i) => i.quantity > 0);
    writeCart(next);
  };

  const removeItem = (productId) => writeCart(cart.filter((i) => i.product_id !== productId));

  const clearCart = () => {
    if (window.confirm("Clear your entire cart?")) writeCart([]);
  };

  const saveList = () => {
    if (!listName.trim()) return;
    const currentTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const currentItems = cart.reduce((s, i) => s + i.quantity, 0);
    const lists = JSON.parse(localStorage.getItem("savedLists") || "[]");
    lists.push({
      id: Date.now().toString(),
      name: listName.trim(),
      items: cart,
      saved_at: new Date().toISOString(),
      item_count: currentItems,
      estimated_total: currentTotal,
    });
    localStorage.setItem("savedLists", JSON.stringify(lists));
    setListName("");
    setShowSaveDialog(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const krogerTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems  = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Empty state ──────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
          <p className="text-gray-500 mb-8">
            Add products from Browse and we'll compare the total price across 10 stores.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Browse"))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  // ── Filled cart ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-40 md:pb-10">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              Cart
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>

        {/* Saved confirmation */}
        {savedMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
            ✓ Shopping list saved
          </div>
        )}

        {/* Compare CTA — the hero action */}
        <button
          onClick={() => navigate(createPageUrl("PriceComparison"))}
          className="w-full mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl p-5 text-left transition-all shadow-lg shadow-blue-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5" />
                <span className="font-bold text-lg">Compare Prices</span>
              </div>
              <p className="text-blue-100 text-sm">
                Find the cheapest store for this entire cart
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-200" />
          </div>
          <div className="mt-3 pt-3 border-t border-blue-500/40 flex items-center justify-between text-sm">
            <span className="text-blue-200">Current prices</span>
            <span className="font-bold text-lg">${krogerTotal.toFixed(2)}</span>
          </div>
        </button>

        {/* Cart items */}
        <div className="space-y-3 mb-6">
          {cart.map((item) => (
            <Card key={item.product_id} className="border border-gray-200 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Image or emoji fallback */}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full items-center justify-center text-2xl"
                      style={{ display: item.image_url ? "none" : "flex" }}
                    >
                      {CATEGORY_ICONS[item.category] || "🛒"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
                      {item.product_name}
                    </h3>
                    {item.unit && (
                      <p className="text-xs text-gray-400 mb-2">{item.unit}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-blue-600 font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-gray-400 ml-1">
                            (${item.price.toFixed(2)} ea)
                          </span>
                        )}
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-xs text-gray-400 hover:text-red-500 mr-2"
                        >
                          Remove
                        </button>
                        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                          <button
                            onClick={() => updateQty(item.product_id, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="px-2 text-sm font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product_id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save list */}
        <button
          onClick={() => setShowSaveDialog(!showSaveDialog)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save as shopping list
        </button>

        {showSaveDialog && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="List name (e.g. Weekly Groceries)"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveList()}
                className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Button size="sm" onClick={saveList} disabled={!listName.trim()} className="bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
              <button onClick={() => setShowSaveDialog(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Cart total ({totalItems} items)</p>
            <p className="text-xl font-bold text-gray-900">${krogerTotal.toFixed(2)}</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("PriceComparison"))}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 gap-2"
          >
            <TrendingDown className="w-4 h-4" />
            Compare Prices
          </Button>
        </div>
      </div>
    </div>
  );
}
