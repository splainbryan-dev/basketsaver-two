// src/pages/Profile.jsx
// User profile — account info, preferences, sign out, app version.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  User, Mail, Bell, Shield, LogOut, ChevronRight,
  TrendingDown, Star, HelpCircle, FileText, Lock,
  Smartphone, Edit2, Save, X, Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function getUser() {
  try { return JSON.parse(localStorage.getItem("basketsaver_user") || "{}"); } catch { return {}; }
}

function getStats() {
  const lists   = JSON.parse(localStorage.getItem("savedLists") || "[]");
  const cart    = JSON.parse(localStorage.getItem("cart") || "[]");
  const pantry  = JSON.parse(localStorage.getItem("bs_pantry") || "[]");
  const totalSaved = lists.reduce((s, l) => s + (l.savings || 0), 0);
  return {
    lists:      lists.length,
    cartItems:  cart.reduce((s, i) => s + i.quantity, 0),
    pantryItems: pantry.length,
    totalSaved,
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(getUser());
  const [stats, setStats]             = useState(getStats());
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName]         = useState("");
  const [notifications, setNotifications] = useState(
    localStorage.getItem("bs_notifications") !== "false"
  );
  const [saved, setSaved]             = useState(false);

  const saveName = () => {
    if (!newName.trim()) return;
    const updated = { ...user, name: newName.trim() };
    localStorage.setItem("basketsaver_user", JSON.stringify(updated));

    // Update in users array too
    const users = JSON.parse(localStorage.getItem("basketsaver_users") || "[]");
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) { users[idx].name = newName.trim(); localStorage.setItem("basketsaver_users", JSON.stringify(users)); }

    setUser(updated);
    setEditingName(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("bs_notifications", String(next));
  };

  const handleSignOut = () => {
    if (window.confirm("Sign out of BasketSaver?")) {
      localStorage.removeItem("basketsaver_user");
      localStorage.removeItem("welcomeShown");
      navigate("/Auth");
    }
  };

  const handleClearData = () => {
    if (window.confirm("This will clear your cart, saved lists, and pantry. Are you sure?")) {
      localStorage.removeItem("cart");
      localStorage.removeItem("savedLists");
      localStorage.removeItem("bs_pantry");
      localStorage.removeItem("bs_budget");
      localStorage.removeItem("bs_purchase_history");
      window.dispatchEvent(new Event("cartUpdated"));
      setStats(getStats());
    }
  };

  const isGuest = user.id === "guest" || !user.id;

  const menuItems = [
    {
      section: "Shopping",
      items: [
        { icon: TrendingDown, label: "Price Comparison", path: "PriceComparison" },
        { icon: Star,         label: "Purchase History",  path: "History" },
      ],
    },
    {
      section: "Account",
      items: [
        { icon: Bell,    label: "Notifications", toggle: true, value: notifications, onToggle: toggleNotifications },
        { icon: Shield,  label: "Privacy Policy", path: "PrivacyPolicy" },
        { icon: FileText,label: "Terms of Service", path: "TermsOfService" },
      ],
    },
    {
      section: "Support",
      items: [
        { icon: HelpCircle,  label: "Help & FAQ", action: () => alert("Coming soon!") },
        { icon: Smartphone,  label: "App Version", value: "1.0.0", noArrow: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg">

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* User card */}
        <Card className="mb-6 border border-gray-200 bg-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "G"}
              </div>

              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveName()}
                      className="flex-1 h-9 px-3 rounded-lg border-2 border-blue-400 text-sm focus:outline-none font-semibold"
                      autoFocus
                    />
                    <button onClick={saveName} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingName(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-lg truncate">
                      {isGuest ? "Guest User" : user.name || "User"}
                    </p>
                    {!isGuest && (
                      <button onClick={() => { setNewName(user.name || ""); setEditingName(true); }}
                        className="text-gray-400 hover:text-blue-500">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                {user.email && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> {user.email}
                  </p>
                )}
                {isGuest && (
                  <button
                    onClick={() => navigate("/Auth")}
                    className="mt-2 text-xs text-blue-600 font-semibold underline"
                  >
                    Create account to save your data →
                  </button>
                )}
              </div>
            </div>

            {/* Saved notice */}
            {saved && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
                <Check className="w-4 h-4" /> Name updated!
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
              {[
                { label: "Saved Lists",   val: stats.lists },
                { label: "Pantry Items",  val: stats.pantryItems },
                { label: "Cart Items",    val: stats.cartItems },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black text-blue-600">{s.val}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu sections */}
        {menuItems.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {section.section}
            </p>
            <Card className="border border-gray-200 overflow-hidden">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    {i > 0 && <div className="h-px bg-gray-100 mx-4" />}
                    <button
                      onClick={
                        item.toggle   ? item.onToggle :
                        item.action   ? item.action :
                        item.path     ? () => navigate(createPageUrl(item.path)) :
                        undefined
                      }
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-800">{item.label}</span>
                      {item.toggle ? (
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${item.value ? "bg-blue-600" : "bg-gray-300"}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${item.value ? "right-1" : "left-1"}`} />
                        </div>
                      ) : item.noArrow ? (
                        <span className="text-xs text-gray-400">{item.value}</span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Danger zone */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Data</p>
          <Card className="border border-gray-200">
            <button
              onClick={handleClearData}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-4 h-4 text-red-500" />
              </div>
              <span className="flex-1 text-sm font-medium text-red-600">Clear App Data</span>
            </button>
          </Card>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-300">BasketSaver v1.0.0</p>
          <p className="text-xs text-gray-300">The Evolution of Shopping with AI</p>
        </div>

      </div>
    </div>
  );
}
