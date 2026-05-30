// src/pages/Pantry.jsx
// Pantry tracker — know what you have at home.
// Traffic light system: 🔴 low, 🟡 medium, 🟢 stocked
// One tap to add low items to cart.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Package, Plus, Minus, Trash2, ShoppingCart,
  AlertTriangle, CheckCircle2, Search, X, ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PANTRY_KEY = "bs_pantry";

const CATEGORY_ICONS = {
  "Dairy & Eggs": "🥛", "Meat & Seafood": "🥩", "Fresh Produce": "🥦",
  "Bakery & Bread": "🍞", Pantry: "🥫", Frozen: "🧊",
  "Breakfast & Cereal": "🥣", Snacks: "🍿", Candy: "🍬",
  Beverages: "🧃", Deli: "🥪", Baking: "🧁",
  "Spices & Seasonings": "🌶️", "Global Cuisine": "🌍", Alcohol: "🍺",
};

const CATEGORIES = [
  "Dairy & Eggs", "Meat & Seafood", "Fresh Produce", "Bakery & Bread",
  "Pantry", "Frozen", "Breakfast & Cereal", "Snacks", "Beverages",
  "Deli", "Baking", "Spices & Seasonings", "Global Cuisine", "Alcohol",
];

function getPantry() {
  try { return JSON.parse(localStorage.getItem(PANTRY_KEY) || "[]"); } catch { return []; }
}

function savePantry(items) {
  localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
}

function getStatus(qty, threshold) {
  if (qty <= 0)             return { label: "Out",     color: "bg-red-100    text-red-600    border-red-200",    dot: "bg-red-500",    priority: 0 };
  if (qty <= threshold)     return { label: "Low",     color: "bg-orange-100 text-orange-600 border-orange-200", dot: "bg-orange-400", priority: 1 };
  if (qty <= threshold * 2) return { label: "Medium",  color: "bg-yellow-100 text-yellow-600 border-yellow-200", dot: "bg-yellow-400", priority: 2 };
  return                           { label: "Stocked", color: "bg-green-100  text-green-600  border-green-200",  dot: "bg-green-500",  priority: 3 };
}

export default function Pantry() {
  const navigate = useNavigate();
  const [items, setItems]           = useState(getPantry());
  const [showAdd, setShowAdd]       = useState(false);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("all");
  const [newItem, setNewItem]       = useState({
    name: "", category: "Pantry", quantity: 1, threshold: 2, unit: "units",
  });

  const save = (updated) => { savePantry(updated); setItems(updated); };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    save([...items, {
      id:        Date.now().toString(),
      name:      newItem.name.trim(),
      category:  newItem.category,
      quantity:  parseInt(newItem.quantity) || 1,
      threshold: parseInt(newItem.threshold) || 2,
      unit:      newItem.unit || "units",
      added_at:  new Date().toISOString(),
    }]);
    setNewItem({ name: "", category: "Pantry", quantity: 1, threshold: 2, unit: "units" });
    setShowAdd(false);
  };

  const updateQty = (id, delta) => {
    save(items.map((i) => i.id === id
      ? { ...i, quantity: Math.max(0, i.quantity + delta) }
      : i
    ));
  };

  const removeItem = (id) => save(items.filter((i) => i.id !== id));

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((c) => c.product_name === item.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        product_id:   `pantry-${item.id}`,
        product_name: item.name,
        price:        0,
        category:     item.category,
        quantity:     1,
        total:        0,
        from_pantry:  true,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addAllLowToCart = () => {
    const low = items.filter((i) => getStatus(i.quantity, i.threshold).priority <= 1);
    low.forEach((item) => addToCart(item));
    navigate(createPageUrl("Cart"));
  };

  // Filter
  const filtered = items
    .filter((i) => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const status = getStatus(i.quantity, i.threshold);
      if (filter === "low")     return matchSearch && status.priority <= 1;
      if (filter === "stocked") return matchSearch && status.priority >= 2;
      return matchSearch;
    })
    .sort((a, b) => getStatus(a.quantity, a.threshold).priority - getStatus(b.quantity, b.threshold).priority);

  const lowCount = items.filter((i) => getStatus(i.quantity, i.threshold).priority <= 1).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" /> My Pantry
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {items.length} items tracked
              {lowCount > 0 && <span className="text-orange-500 font-medium"> · {lowCount} running low</span>}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Low items alert */}
        {lowCount > 0 && (
          <Card className="mb-4 border-orange-200 bg-orange-50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-800 text-sm">
                    {lowCount} item{lowCount !== 1 ? "s" : ""} running low or out
                  </p>
                  <p className="text-xs text-orange-600">Add them all to your cart at once</p>
                </div>
              </div>
              <button
                onClick={addAllLowToCart}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 flex-shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Add All
              </button>
            </CardContent>
          </Card>
        )}

        {/* Add item form */}
        {showAdd && (
          <Card className="mb-4 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Add Pantry Item</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Item name (e.g. Whole Milk)"
                  value={newItem.name}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Unit</label>
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    >
                      {["units", "gallons", "lbs", "oz", "boxes", "bags", "cans", "bottles", "dozen"].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Current Quantity</label>
                    <input type="number" min="0" value={newItem.quantity}
                      onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Low Alert At</label>
                    <input type="number" min="1" value={newItem.threshold}
                      onChange={(e) => setNewItem((p) => ({ ...p, threshold: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
                <button
                  onClick={addItem}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Add to Pantry
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search + filter */}
        {items.length > 0 && (
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search pantry..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            <div className="flex gap-1">
              {["all", "low", "stocked"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-colors capitalize ${
                    filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items list */}
        {items.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-700 mb-2">Your pantry is empty</h3>
              <p className="text-sm text-gray-400 mb-4">
                Track what you have at home so you never run out of essentials.
              </p>
              <button onClick={() => setShowAdd(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Add First Item
              </button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No items match your filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const status = getStatus(item.quantity, item.threshold);
              return (
                <Card key={item.id} className="border border-gray-200 bg-white">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Status dot */}
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status.dot}`} />

                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {CATEGORY_ICONS[item.category] || "🛒"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{item.category} · alert at {item.threshold} {item.unit}</p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        {status.priority <= 1 && (
                          <button
                            onClick={() => addToCart(item)}
                            className="mr-1 text-blue-600 hover:text-blue-800"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeItem(item.id)}
                          className="ml-1 text-gray-300 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
