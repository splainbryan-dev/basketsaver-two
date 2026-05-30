// src/components/LoadingSplash.jsx
// Splash screen shown on first app load. Pure CSS animation, no dependencies.

import { useState, useEffect } from "react";
import { TrendingDown } from "lucide-react";

export default function LoadingSplash({ onLoadComplete }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer   = setTimeout(() => setFadeOut(true),  2000);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      onLoadComplete?.();
    }, 3000);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [onLoadComplete]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
      <div className="text-center">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <TrendingDown className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">BasketSaver</h1>
        <p className="text-white/90 text-lg mb-8">Find the best grocery deals</p>
        <p className="text-white/60 text-sm">© {new Date().getFullYear()} BasketSaver. All rights reserved.</p>
      </div>
    </div>
  );
}
