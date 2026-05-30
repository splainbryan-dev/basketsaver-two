// src/pages/Templates.jsx
// Manage reusable shopping lists saved from Cart.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ClipboardList, ShoppingCart, Trash2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Templates() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);

  const load = () => setLists(JSON.parse(localStorage.getItem("savedLists") || "[]"));
  useEffect(() => { load(); }, []);

  const deleteList = (id) => {
    if (!window.confirm("Delete this list?")) return;
    const updated = lists.filter((l) => l.id !== id);
    localStorage.setItem("savedLists", JSON.stringify(updated));
    setLists(updated);
  };

  const loadToCart = (list) => {
    localStorage.setItem("cart", JSON.stringify(list.items || []));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate(createPageUrl("Cart"));
  };

  const compareList = (list) => {
    localStorage.setItem("cart", JSON.stringify(list.items || []));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate(createPageUrl("PriceComparison"));
  };

  if (lists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved lists yet</h2>
          <p className="text-gray-500 mb-8">
            Build a cart and tap "Save as shopping list" to create reusable templates you can load in one tap.
          </p>
          <Button onClick={() => navigate(createPageUrl("Browse"))} className="bg-blue-600 hover:bg-blue-700 rounded-full px-8">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" /> Shopping Templates
      </h1>
      <p className="text-gray-500 text-sm mb-6">{lists.length} saved list{lists.length !== 1 ? "s" : ""}</p>

      <div className="space-y-3">
        {lists.map((list) => (
          <Card key={list.id} className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{list.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {list.item_count} item{list.item_count !== 1 ? "s" : ""} · Est. ${list.estimated_total?.toFixed(2)} at Kroger
                  </p>
                  {list.saved_at && (
                    <p className="text-xs text-gray-300 mt-0.5">
                      Saved {new Date(list.saved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button onClick={() => deleteList(list.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadToCart(list)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" /> Load to Cart
                </button>
                <button
                  onClick={() => compareList(list)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <TrendingDown className="w-4 h-4" /> Compare Prices
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
