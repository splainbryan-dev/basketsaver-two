// src/pages/Layout.jsx
// Full nav matching the old app:
// Desktop: Browse · Scan · Buy Again · Cart(badge) · Templates · Orders | Rewards · Referrals
// Mobile bottom: Browse · Scan · Buy Again · Cart · Templates (5 primary)
// Mobile overflow: Orders, Rewards, Referrals accessible via More or direct URL

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, ScanLine, RefreshCcw, ShoppingCart,
  ClipboardList, Package, TrendingDown, BarChart2,
  PiggyBank, UtensilsCrossed, User,
} from "lucide-react";

const DESKTOP_NAV = [
  { name: "Browse",    path: createPageUrl("Browse"),         icon: Home          },
  { name: "Scan",      path: createPageUrl("ScanProduct"),    icon: ScanLine      },
  { name: "Buy Again", path: createPageUrl("BuyAgain"),       icon: RefreshCcw    },
  { name: "Cart",      path: createPageUrl("Cart"),           icon: ShoppingCart,  badge: true },
  { name: "Templates", path: createPageUrl("Templates"),      icon: ClipboardList },
  { name: "Orders",    path: createPageUrl("Orders"),         icon: Package       },
  { name: "History",   path: createPageUrl("History"),        icon: BarChart2     },
  { name: "Budget",    path: createPageUrl("Budget"),         icon: PiggyBank     },
  { name: "Pantry",    path: createPageUrl("Pantry"),         icon: UtensilsCrossed },
  { name: "Profile",   path: createPageUrl("Profile"),        icon: User          },
];

const MOBILE_NAV = [
  { name: "Browse",    path: createPageUrl("Browse"),         icon: Home          },
  { name: "Scan",      path: createPageUrl("ScanProduct"),    icon: ScanLine      },
  { name: "Buy Again", path: createPageUrl("BuyAgain"),       icon: RefreshCcw    },
  { name: "Cart",      path: createPageUrl("Cart"),           icon: ShoppingCart,  badge: true },
  { name: "Templates", path: createPageUrl("Templates"),      icon: ClipboardList },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    sync();
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  const isActive = (path) =>
    location.pathname === path ||
    (path === createPageUrl("Browse") && location.pathname === "/");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Desktop header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <Link to={createPageUrl("Browse")} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-gray-900">BasketSaver</p>
              <p className="text-xs text-gray-400">Stop overpaying for groceries</p>
            </div>
          </Link>

          {/* User + sign out */}
          {(() => {
            try {
              const u = JSON.parse(localStorage.getItem("basketsaver_user") || "{}");
              if (u.name && u.name !== "Guest") return (
                <div className="flex items-center gap-3 mr-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{u.name.split(" ")[0]}</span>
                </div>
              );
            } catch {}
            return null;
          })()}

          <nav className="flex items-center gap-0.5 flex-wrap justify-end">
            {DESKTOP_NAV.map(({ name, path, icon: Icon, badge }) => (
              <Link
                key={name}
                to={path}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(path)
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {name}
                {badge && cartCount > 0 && (
                  <span className="ml-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 h-14 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight flex-1">
            <p className="font-bold text-gray-900 text-sm">BasketSaver</p>
            <p className="text-[10px] text-gray-400">Stop overpaying for groceries</p>
          </div>
          </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex">
          {MOBILE_NAV.map(({ name, path, icon: Icon, badge }) => (
            <Link
              key={name}
              to={path}
              onClick={() => {
                if (name === "Browse" && isActive(path)) {
                  window.dispatchEvent(new Event("browseScrollTop"));
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 relative transition-colors ${
                isActive(path) ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-green-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{name}</span>
            </Link>
          ))}
        </div>
      </nav>

    </div>
  );
}
