// src/pages/Budget.jsx
// Monthly grocery budget tracker.
// Tracks spend vs budget, category limits, pace, and total savings.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DollarSign, AlertCircle,
  CheckCircle2, Edit2, Save, ShoppingBag, ArrowRight,
  PiggyBank, Calendar, BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BUDGET_KEY = "bs_budget";
const DEFAULT_BUDGET = {
  monthly: 600,
  categories: {
    "Meat & Seafood":     100,
    "Fresh Produce":       80,
    "Dairy & Eggs":        60,
    "Pantry":              80,
    "Beverages":           40,
    "Snacks":              30,
    "Frozen":              50,
    "Bakery & Bread":      30,
    "Breakfast & Cereal":  30,
    "Other":               100,
  },
};

function getBudget() {
  try {
    return JSON.parse(localStorage.getItem(BUDGET_KEY) || JSON.stringify(DEFAULT_BUDGET));
  } catch { return DEFAULT_BUDGET; }
}

function saveBudget(b) {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(b));
}

function getSpendThisMonth() {
  const lists = JSON.parse(localStorage.getItem("savedLists") || "[]");
  const history = JSON.parse(localStorage.getItem("bs_purchase_history") || "[]");
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const allEvents = [...lists, ...history];
  let total = 0;
  const byCategory = {};

  allEvents.forEach((e) => {
    const date = e.saved_at || e.date || "";
    if (!date.startsWith(thisMonth)) return;
    total += e.estimated_total || e.total || 0;
    (e.items || []).forEach((item) => {
      const cat = item.category || "Other";
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += (item.price || 0) * (item.quantity || 1);
    });
  });

  return { total, byCategory };
}

function getDaysInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function getDayOfMonth() {
  return new Date().getDate();
}

export default function Budget() {
  const navigate = useNavigate();
  const [budget, setBudget]       = useState(getBudget());
  const [editing, setEditing]     = useState(false);
  const [editVal, setEditVal]     = useState("");
  const [editCats, setEditCats]   = useState({});
  const [spend, setSpend]         = useState({ total: 0, byCategory: {} });

  useEffect(() => {
    setSpend(getSpendThisMonth());
  }, []);

  const startEdit = () => {
    setEditVal(String(budget.monthly));
    setEditCats({ ...budget.categories });
    setEditing(true);
  };

  const saveEdit = () => {
    const updated = {
      monthly: parseFloat(editVal) || 600,
      categories: Object.fromEntries(
        Object.entries(editCats).map(([k, v]) => [k, parseFloat(v) || 0])
      ),
    };
    saveBudget(updated);
    setBudget(updated);
    setEditing(false);
  };

  const daysLeft     = getDaysInMonth() - getDayOfMonth();
  const pct          = Math.min(Math.round((spend.total / budget.monthly) * 100), 100);
  const overBudget   = spend.total > budget.monthly;
  const remaining    = budget.monthly - spend.total;

  // No spend yet
  const noData = spend.total === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PiggyBank className="w-6 h-6 text-blue-600" /> Budget Tracker
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={editing ? saveEdit : startEdit}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              editing
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {editing ? <><Save className="w-4 h-4" /> Save</> : <><Edit2 className="w-4 h-4" /> Edit</>}
          </button>
        </div>

        {/* Main budget card */}
        <Card className={`mb-6 border-2 ${overBudget ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
          <CardContent className="p-5">
            {editing ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Budget</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    className="text-3xl font-black text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-32"
                  />
                  <span className="text-gray-400 text-lg">/month</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Monthly Budget</p>
                    <p className="text-4xl font-black text-gray-900">${budget.monthly}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Spent</p>
                    <p className={`text-3xl font-black ${overBudget ? "text-red-600" : "text-gray-900"}`}>
                      ${spend.total.toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        overBudget ? "bg-red-500" : pct >= 85 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{pct}% used</span>
                    <span>{daysLeft} days left</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>





        {/* Category budgets */}
        <Card className="mb-6 border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" /> Category Budgets
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {Object.entries(editing ? editCats : budget.categories).map(([cat, limit]) => {
              const spent = spend.byCategory[cat] || 0;
              const catPct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
              const catOver = spent > limit && limit > 0;

              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cat}</span>
                    {editing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          value={editCats[cat] || ""}
                          onChange={(e) => setEditCats((prev) => ({ ...prev, [cat]: e.target.value }))}
                          className="w-16 text-right border-b border-blue-400 focus:outline-none text-sm font-semibold"
                        />
                      </div>
                    ) : (
                      <span className={`font-medium ${catOver ? "text-red-500" : "text-gray-500"}`}>
                        ${spent.toFixed(0)} / ${limit}
                      </span>
                    )}
                  </div>
                  {!editing && (
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          catOver ? "bg-red-400" : catPct >= 80 ? "bg-yellow-400" : "bg-blue-400"
                        }`}
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* No data CTA */}
        {noData && (
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No spending recorded yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Save shopping lists from your cart to track spending against your budget.
              </p>
              <button
                onClick={() => navigate(createPageUrl("Browse"))}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm flex items-center gap-2 mx-auto"
              >
                Start Shopping <ArrowRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* Compare CTA */}
        {!noData && remaining > 0 && (
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white">Maximize your remaining ${remaining.toFixed(0)}</p>
                  <p className="text-blue-200 text-xs">Compare prices to stretch your budget further</p>
                </div>
                <button
                  onClick={() => navigate(createPageUrl("Cart"))}
                  className="bg-white text-blue-700 font-bold px-4 py-2 rounded-full text-sm flex-shrink-0"
                >
                  Compare →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
