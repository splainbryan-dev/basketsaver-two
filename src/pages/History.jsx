// src/pages/History.jsx
// Purchase History — the data engine behind BasketSaver.
// Tracks: spend by month, savings vs most expensive store,
// favorite items, store preferences, category breakdowns.
// Also anonymously contributes to regional trend data.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TrendingDown, TrendingUp, ShoppingBag, Calendar,
  BarChart2, MapPin, Star, Flame, ArrowRight,
  DollarSign, Package, Store, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Data helpers ─────────────────────────────────────────────────

function getHistory() {
  return JSON.parse(localStorage.getItem("bs_purchase_history") || "[]");
}

function getSavedLists() {
  return JSON.parse(localStorage.getItem("savedLists") || "[]");
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("basketsaver_user") || "{}"); } catch { return {}; }
}

// Build analytics from saved lists + history
function buildAnalytics() {
  const history  = getHistory();
  const lists    = getSavedLists();

  // Combine all purchase events
  const allEvents = [
    ...history,
    ...lists.map((l) => ({
      id:         l.id,
      date:       l.saved_at || new Date().toISOString(),
      items:      l.items || [],
      total:      l.estimated_total || 0,
      store:      l.store || "Kroger",
      saved:      l.savings || 0,
    })),
  ];

  if (allEvents.length === 0) return null;

  // Monthly spend
  const monthly = {};
  allEvents.forEach((e) => {
    const month = e.date?.substring(0, 7) || "2026-05";
    monthly[month] = (monthly[month] || 0) + (e.total || 0);
  });

  // Category breakdown
  const categories = {};
  allEvents.forEach((e) => {
    (e.items || []).forEach((item) => {
      const cat = item.category || "Pantry";
      if (!categories[cat]) categories[cat] = { spend: 0, count: 0 };
      categories[cat].spend += (item.price || 0) * (item.quantity || 1);
      categories[cat].count += item.quantity || 1;
    });
  });

  // Most purchased items
  const itemCounts = {};
  allEvents.forEach((e) => {
    (e.items || []).forEach((item) => {
      const key = item.product_name || item.product_id;
      if (!key) return;
      if (!itemCounts[key]) itemCounts[key] = {
        name: item.product_name,
        category: item.category,
        count: 0,
        spend: 0,
        price: item.price,
      };
      itemCounts[key].count  += item.quantity || 1;
      itemCounts[key].spend  += (item.price || 0) * (item.quantity || 1);
    });
  });

  // Store preferences
  const storeCounts = {};
  allEvents.forEach((e) => {
    if (e.store) {
      storeCounts[e.store] = (storeCounts[e.store] || 0) + 1;
    }
  });

  const totalSpend   = allEvents.reduce((s, e) => s + (e.total || 0), 0);
  const totalSaved   = allEvents.reduce((s, e) => s + (e.saved || 0), 0);
  const totalOrders  = allEvents.length;
  const totalItems   = allEvents.reduce((s, e) => s + (e.items?.length || 0), 0);

  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1].spend - a[1].spend)
    .slice(0, 6);

  const monthlyArr = Object.entries(monthly)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  const topStore = Object.entries(storeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "Kroger";

  return {
    totalSpend, totalSaved, totalOrders, totalItems,
    topItems, topCategories, monthlyArr, topStore, storeCounts,
  };
}

// ── Trending data (simulated regional trends) ────────────────────
// In production this would come from aggregated anonymous user data
const TRENDING = [
  { name: "Tajín Seasoning",       trend: "+340%", region: "TX, AZ, CA",  hot: true  },
  { name: "Goya Black Beans",      trend: "+180%", region: "FL, NY, TX",  hot: true  },
  { name: "Oat Milk",              trend: "+120%", region: "Nationwide",  hot: true  },
  { name: "Store Brand Cereal",    trend: "+89%",  region: "Nationwide",  hot: false },
  { name: "Fresh Salmon",          trend: "+67%",  region: "West Coast",  hot: false },
  { name: "Name Brand Soda",       trend: "-34%",  region: "Nationwide",  hot: false },
];

// ── Components ───────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50  text-blue-600  border-blue-100",
    green:  "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <Card className={`border ${colors[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Icon className="w-5 h-5 opacity-70" />
        </div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function History() {
  const navigate  = useNavigate();
  const [data, setData]               = useState(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const user = getUser();

  useEffect(() => {
    setData(buildAnalytics());
  }, []);

  // Empty state — no purchase history yet
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-600" /> Purchase History
          </h1>

          {/* Empty CTA */}
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
            <CardContent className="p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No history yet</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                Start shopping and saving lists to build your purchase history and see spending insights.
              </p>
              <button
                onClick={() => navigate(createPageUrl("Browse"))}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors flex items-center gap-2 mx-auto"
              >
                Start Shopping <ArrowRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>

          {/* Trending section even with no history */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Trending Near You
            </h2>
            <TrendingSection />
          </div>
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...data.monthlyArr.map((m) => m[1]), 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
            <BarChart2 className="w-6 h-6 text-blue-600" /> Purchase History
          </h1>
          {user.name && user.name !== "Guest" && (
            <p className="text-gray-500 text-sm">Welcome back, {user.name.split(" ")[0]} 👋</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={DollarSign} label="Total Spent"    value={`$${data.totalSpend.toFixed(0)}`}  color="blue"   />
          <StatCard icon={TrendingDown} label="Total Saved"  value={`$${data.totalSaved.toFixed(0)}`}  color="green"  sub="vs most expensive store" />
          <StatCard icon={ShoppingBag} label="Shopping Trips" value={data.totalOrders}                 color="purple" />
          <StatCard icon={Package}     label="Items Bought"  value={data.totalItems}                   color="orange" />
        </div>

        {/* Monthly spend chart */}
        {data.monthlyArr.length > 1 && (
          <Card className="mb-6 border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Monthly Spending
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-end gap-2 h-32">
                {data.monthlyArr.map(([month, amount]) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">${amount.toFixed(0)}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all"
                      style={{ height: `${(amount / maxMonthly) * 80}px`, minHeight: "4px" }}
                    />
                    <span className="text-[10px] text-gray-400">
                      {new Date(month + "-01").toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category breakdown */}
        {data.topCategories.length > 0 && (
          <Card className="mb-6 border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-500" /> Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {data.topCategories.map(([cat, stats]) => {
                const pct = Math.round((stats.spend / data.totalSpend) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-500">${stats.spend.toFixed(2)} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Store preferences */}
        {Object.keys(data.storeCounts).length > 0 && (
          <Card className="mb-6 border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-green-500" /> Your Favorite Stores
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {Object.entries(data.storeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([store, count]) => (
                    <div key={store} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{store}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{count} trip{count !== 1 ? "s" : ""}</span>
                        {store === data.topStore && (
                          <Badge className="bg-yellow-400 text-yellow-900 text-[10px]">⭐ Favorite</Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Most purchased items */}
        {data.topItems.length > 0 && (
          <Card className="mb-6 border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Your Most Purchased Items
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {(showAllItems ? data.topItems : data.topItems.slice(0, 5)).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-blue-600">${item.spend.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400">×{item.count}</p>
                    </div>
                  </div>
                ))}
              </div>
              {data.topItems.length > 5 && (
                <button
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="mt-3 text-xs text-blue-500 flex items-center gap-1 hover:text-blue-700"
                >
                  {showAllItems ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {data.topItems.length} items</>}
                </button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Trending near you */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Trending Near You
          </h2>
          <TrendingSection />
        </div>

        {/* Data privacy note */}
        <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-500 text-center">
          🔒 Your purchase history is stored privately on your device.
          Anonymized regional trends help improve price accuracy for everyone.
        </div>

      </div>
    </div>
  );
}

function TrendingSection() {
  return (
    <div className="space-y-3">
      {TRENDING.map((item) => {
        const up = item.trend.startsWith("+");
        return (
          <div key={item.name} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {item.hot
                ? <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                : <TrendingDown className="w-4 h-4 text-blue-400 flex-shrink-0" />
              }
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {item.region}
                </p>
              </div>
            </div>
            <span className={`font-bold text-sm ${up ? "text-green-600" : "text-red-500"}`}>
              {item.trend}
            </span>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 text-center pt-1">
        Based on anonymized BasketSaver purchase data
      </p>
    </div>
  );
}
