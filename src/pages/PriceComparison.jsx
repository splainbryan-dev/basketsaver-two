// src/pages/PriceComparison.jsx
// Simplified comparison — background feature, not the hero.
// Shows store ranking cleanly without overwhelming charts.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, TrendingDown, Award, Loader2,
  DollarSign, ExternalLink, Sparkles,
} from "lucide-react";
import { compareCartAcrossStores, STORE_LINKS } from "@/api/pricingEngine";

const TIER_LABELS = {
  best_value: { label: "Best Value", color: "bg-green-100 text-green-800 border-green-200" },
  balanced:   { label: "Balanced",   color: "bg-blue-100 text-blue-800 border-blue-200" },
  premium:    { label: "Premium",    color: "bg-purple-100 text-purple-800 border-purple-200" },
};

export default function PriceComparison() {
  const navigate = useNavigate();
  const [cart, setCart]             = useState([]);
  const [results, setResults]       = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(cartData);
    if (cartData.length > 0) runComparison(cartData);
  }, []);

  const runComparison = (cartItems) => {
    setIsCalculating(true);
    const engineInput = cartItems.map(item => ({
      product: {
        id: item.product_id, name: item.product_name,
        price: item.price, kroger_price: item.price,
        category: item.category || "Pantry",
        estimated_prices: item.estimated_prices || null,
      },
      quantity: item.quantity,
    }));
    setTimeout(() => {
      const comparison = compareCartAcrossStores(engineInput);
      setResults(comparison);
      setIsCalculating(false);
    }, 800);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 pb-24">
        <div className="max-w-md mx-auto text-center">
          <TrendingDown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No items to compare</h2>
          <p className="text-gray-500 mb-6">Add items to your cart first</p>
          <Button onClick={() => navigate(createPageUrl("Browse"))} className="bg-blue-600 hover:bg-blue-700">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  const bestStore     = results[0];
  const mostExpensive = results[results.length - 1];
  const totalSavings  = bestStore && mostExpensive
    ? mostExpensive.raw_total - bestStore.raw_total : 0;

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Cart"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-500" />
              Price Comparison
            </h1>
            <p className="text-xs text-gray-400">
              {cart.length} item{cart.length !== 1 ? "s" : ""} · Compared across available stores
            </p>
          </div>
        </div>

        {/* Calculating */}
        {isCalculating && (
          <Card className="mb-5 border-blue-100 bg-blue-50">
            <CardContent className="p-5 text-center">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="font-semibold text-blue-900 text-sm">Comparing prices across stores...</p>
            </CardContent>
          </Card>
        )}

        {/* Savings banner */}
        {!isCalculating && results.length > 0 && totalSavings > 0 && (
          <Card className="mb-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium">You could save up to</p>
                  <p className="text-2xl font-bold text-green-800">${totalSavings.toFixed(2)}</p>
                  <p className="text-xs text-green-600">
                    shopping at {bestStore.name} vs {mostExpensive.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store results */}
        {!isCalculating && results.map((store, i) => {
          const tier       = TIER_LABELS[store.tier];
          const isSelected = selectedStore === store.name;
          const storeLink  = STORE_LINKS[store.name];

          return (
            <Card
              key={store.name}
              className={`mb-2.5 transition-all cursor-pointer ${
                i === 0
                  ? "border-2 border-green-400 shadow-sm shadow-green-100"
                  : "border border-gray-100 hover:border-blue-200"
              }`}
              onClick={() => setSelectedStore(isSelected ? null : store.name)}
            >
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    i === 0 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {i === 0 ? <Award className="w-4 h-4" /> : i + 1}
                  </div>

                  {/* Name + tier */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm">{store.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${tier.color}`}>
                        {tier.label}
                      </span>

                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {i === 0 && totalSavings > 0
                        ? `Save $${store.savings_vs_most_expensive.toFixed(2)} vs most expensive`
                        : store.savings_vs_most_expensive > 0
                        ? `$${store.savings_vs_most_expensive.toFixed(2)} more than cheapest`
                        : "Most expensive option"}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-gray-900">
                      ${store.total_low.toFixed(2)}
                      <span className="text-gray-400 font-normal text-xs"> – ${store.total_high.toFixed(2)}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">est. range</p>
                  </div>
                </div>

                {/* Expanded breakdown */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Item Breakdown</p>
                    <div className="space-y-1">
                      {store.items.map((item, j) => (
                        <div key={j} className="flex justify-between text-xs">
                          <span className={`truncate flex-1 mr-2 ${!item.available ? "text-orange-400 italic" : "text-gray-600"}`}>
                            {item.product_name || item.name}
                            {item.quantity > 1 && <span className="text-gray-400"> × {item.quantity}</span>}
                            {!item.available && <span className="ml-1 text-[10px]">(substitute)</span>}
                          </span>
                          <span className={`font-medium flex-shrink-0 ${!item.available ? "text-orange-400" : "text-gray-800"}`}>
                            ${(item.estimated_price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {storeLink && (
                      <a
                        href={storeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        onClick={e => e.stopPropagation()}
                      >
                        Shop at {store.name} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Scan receipt CTA */}
        {!isCalculating && results.length > 0 && (
          <Card className="mt-5 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Help improve estimates</p>
                    <p className="text-xs text-gray-500">Scan your receipt to contribute real prices</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap text-xs"
                  onClick={() => navigate(createPageUrl("ScanProduct"))}
                >
                  Scan Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
