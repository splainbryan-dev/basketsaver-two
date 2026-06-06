// src/pages/Orders.jsx
// Order history stored in localStorage key "basketsaver_orders".
// Orders are created when user saves a cart via Cart.jsx.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package, ShoppingBag, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Orders saved by Cart.jsx when user saves a list
    const saved = JSON.parse(localStorage.getItem("savedLists") || "[]");
    // Show newest first
    setOrders([...saved].reverse());
  }, []);

  const loadToCart = (order) => {
    localStorage.setItem("cart", JSON.stringify(order.items || []));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate(createPageUrl("Cart"));
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-500 mb-8">
            Save a shopping list from your cart and it will appear here as an order you can reload anytime.
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
        <Package className="w-6 h-6 text-orange-500" /> My Orders
      </h1>
      <p className="text-gray-500 text-sm mb-6">{orders.length} saved order{orders.length !== 1 ? "s" : ""}</p>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="border border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{order.name}</CardTitle>
                  {order.saved_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.saved_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </p>
                  )}
                </div>
                <Badge className="bg-green-500 text-white flex-shrink-0">Saved</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 mb-4">
                {(order.items || []).slice(0, 4).map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 flex-1 truncate pr-2">
                      {item.product_name}
                      {item.quantity > 1 && <span className="text-gray-400"> × {item.quantity}</span>}
                    </span>
                    <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {(order.items || []).length > 4 && (
                  <p className="text-xs text-gray-400">+{order.items.length - 4} more items</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">{order.item_count} items · est. total</p>
                  <p className="text-lg font-bold text-green-600">${order.estimated_total?.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadToCart(order)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Reorder
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem("cart", JSON.stringify(order.items || []));
                      window.dispatchEvent(new Event("cartUpdated"));
                      navigate(createPageUrl("PriceComparison"));
                    }}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> Compare
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
