// src/pages/BuyAgain.jsx
// Shows items from previously saved lists for quick re-adding to cart.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { RefreshCcw, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORY_ICONS = {
  "Dairy & Eggs": "🥛", "Meat & Seafood": "🥩", "Fresh Produce": "🥦",
  "Bakery & Bread": "🍞", Pantry: "🥫", Frozen: "🧊",
  "Breakfast & Cereal": "🥣", Snacks: "🍿", Beverages: "🧃",
  Deli: "🥪", Candy: "🍬", Baking: "🧁", Alcohol: "🍺", International: "🌍",
};

function ItemImage({ item }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (item.image_url && !imgFailed) {
    return (
      <img
        src={item.image_url}
        alt={item.product_name}
        className="w-full h-16 object-contain"
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <div className="text-3xl text-center">
      {CATEGORY_ICONS[item.category] || "🛒"}
    </div>
  );
}

export default function BuyAgain() {
  const navigate = useNavigate();
  const [pastItems, setPastItems] = useState([]);
  const [added, setAdded] = useState({});

  useEffect(() => {
    const lists = JSON.parse(localStorage.getItem("savedLists") || "[]");
    const seen = new Map();
    lists.forEach((list) =>
      (list.items || []).forEach((item) => {
        if (!seen.has(item.product_id)) seen.set(item.product_id, item);
      })
    );
    setPastItems([...seen.values()]);
  }, []);

  const handleAdd = (item) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i) => i.product_id === item.product_id);
    if (existing) {
      existing.quantity += 1;
      existing.total = existing.quantity * existing.price;
    } else {
      cart.push({ ...item, quantity: 1, total: item.price });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded((prev) => ({ ...prev, [item.product_id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [item.product_id]: false })), 1500);
  };

  if (pastItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCcw className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No history yet</h2>
          <p className="text-gray-500 mb-8">
            Save a shopping list from your cart and your items will appear here for quick reordering.
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
        <RefreshCcw className="w-6 h-6 text-blue-600" /> Buy Again
      </h1>
      <p className="text-gray-500 text-sm mb-6">Items from your saved shopping lists</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pastItems.map((item) => (
          <Card key={item.product_id} className="border border-gray-200 bg-white">
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="h-16 flex items-center justify-center py-1">
                <ItemImage item={item} />
              </div>
              <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight text-center">
                {item.product_name}
              </p>
              <p className="text-blue-600 font-bold text-sm text-center">
                ${item.price?.toFixed(2)}
              </p>
              <button
                onClick={() => handleAdd(item)}
                className={`mt-auto w-full flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2 rounded-lg transition-colors ${
                  added[item.product_id]
                    ? "bg-green-500"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {added[item.product_id]
                  ? <><Check className="w-3 h-3" /> Added</>
                  : <><Plus className="w-3 h-3" /> Add to Cart</>
                }
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
