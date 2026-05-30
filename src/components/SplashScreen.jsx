// src/components/SplashScreen.jsx
import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("open"),  600);
    const t2 = setTimeout(() => setPhase("text"),  1200);
    const t3 = setTimeout(() => setPhase("exit"),  3000);
    const t4 = setTimeout(() => onComplete?.(),    3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)" }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          width: "100%",
          height: "100%",
        }} />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* AI badge */}
      <div className={`mb-8 transition-all duration-500 ${phase === "enter" ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}>
        <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm rounded-full px-5 py-2">
          <Cpu className="w-4 h-4 text-blue-300" />
          <span className="text-blue-200 text-xs font-semibold tracking-widest uppercase">
            The Evolution of Shopping with AI
          </span>
        </div>
      </div>

      {/* Animated shopping bag */}
      <div className={`relative mb-8 transition-all duration-600 ${
        phase === "enter" ? "scale-50 opacity-0" : "scale-100 opacity-100"
      }`}>
        <svg width="130" height="150" viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl">
          {/* Bag glow */}
          <ellipse cx="65" cy="145" rx="45" ry="6" fill="#3B82F6" fillOpacity="0.3" />

          {/* Bag body */}
          <rect x="8" y="48" width="114" height="94" rx="16" fill="white" fillOpacity="0.95" />

          {/* Bag stripe */}
          <rect x="8" y="48" width="114" height="28" rx="16" fill="#DBEAFE" />
          <rect x="8" y="62" width="114" height="14" fill="#DBEAFE" />

          {/* Handle */}
          <path d="M 38 48 Q 38 16 65 16 Q 92 16 92 48"
            stroke="white" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.9" />

          {/* $ symbol */}
          <text x="65" y="118" textAnchor="middle" fontSize="44" fontWeight="900"
            fill="#2563EB" fontFamily="Georgia, serif">$</text>

          {/* Shine */}
          <ellipse cx="36" cy="68" rx="10" ry="5" fill="white" fillOpacity="0.4" />

          {/* AI circuit lines on bag */}
          {(phase === "text" || phase === "exit") && (
            <>
              <line x1="20" y1="90" x2="40" y2="90" stroke="#93C5FD" strokeWidth="1.5" opacity="0.6" />
              <line x1="40" y1="90" x2="40" y2="100" stroke="#93C5FD" strokeWidth="1.5" opacity="0.6" />
              <circle cx="40" cy="100" r="2" fill="#60A5FA" />
              <line x1="90" y1="95" x2="110" y2="95" stroke="#93C5FD" strokeWidth="1.5" opacity="0.6" />
              <circle cx="90" cy="95" r="2" fill="#60A5FA" />
            </>
          )}
        </svg>

        {/* Sparkles */}
        {(phase === "text" || phase === "exit") && (
          <>
            <div className="absolute -top-3 -right-1 text-yellow-300 text-xl animate-bounce">✦</div>
            <div className="absolute -top-1 -left-3 text-blue-300 text-sm animate-pulse">✦</div>
            <div className="absolute top-6 -right-4 text-white text-xs animate-bounce" style={{ animationDelay: "0.3s" }}>✦</div>
          </>
        )}
      </div>

      {/* App name + tagline */}
      <div className={`text-center px-6 transition-all duration-500 ${
        phase === "text" || phase === "exit" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        <div className="mb-1">
          <span className="text-xs font-bold tracking-widest uppercase text-blue-400">AI-Powered Grocery Savings</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
          Basket<span className="text-yellow-300">Saver</span>
        </h1>
        <p className="text-blue-200 text-base font-medium">Stop Overpaying for Groceries</p>
      </div>

      {/* Loading bar */}
      <div className={`mt-10 w-48 transition-all duration-500 ${phase === "enter" ? "opacity-0" : "opacity-100"}`}>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-yellow-300 rounded-full transition-all"
            style={{
              width: phase === "open" ? "30%" : phase === "text" ? "70%" : phase === "exit" ? "100%" : "0%",
              transitionDuration: "600ms",
            }}
          />
        </div>
      </div>

    </div>
  );
}
