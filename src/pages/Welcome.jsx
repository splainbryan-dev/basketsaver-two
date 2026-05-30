// src/pages/Welcome.jsx
// Rebuilt from Good_BasketSaver without Base44 CDN image URLs.
// Store logos are inline SVG/CSS — no external dependencies.

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TrendingDown, ShoppingCart, ClipboardList, Camera,
  Award, Sparkles, ArrowRight, CheckCircle2, Cpu
} from "lucide-react";

// Store logos as colored letter badges — no CDN needed
const STORES = [
  { name: "Walmart",      letter: "W",   bg: "#0071CE", text: "#fff" },
  { name: "Target",       letter: "T",   bg: "#CC0000", text: "#fff" },
  { name: "Costco",       letter: "C",   bg: "#005DAA", text: "#fff" },
  { name: "Kroger",       letter: "K",   bg: "#003087", text: "#fff" },
  { name: "Whole Foods",  letter: "WF",  bg: "#00674B", text: "#fff" },
  { name: "Aldi",         letter: "A",   bg: "#00529B", text: "#fff" },
  { name: "Publix",       letter: "P",   bg: "#2E7D32", text: "#fff" },
  { name: "Trader Joe's", letter: "TJ",  bg: "#C0392B", text: "#fff" },
  { name: "Sam's Club",   letter: "S",   bg: "#0067A0", text: "#fff" },
];

const FEATURES = [
  {
    icon: TrendingDown,
    color: "from-blue-500 to-cyan-500",
    title: "Compare Prices Across 10 Major Stores",
    description: "We scan prices from Walmart, Target, Costco, Kroger, Whole Foods, Aldi, Publix, Trader Joe's, Sam's Club & more to find you the absolute best deals.",
  },
  {
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-500",
    title: "Smart Cart Comparison",
    description: "Add items to your cart and instantly see which store offers the lowest total price. Save hundreds of dollars per month by shopping at the right place.",
  },
  {
    icon: ClipboardList,
    color: "from-purple-500 to-pink-500",
    title: "Reusable Shopping Templates",
    description: "Save your weekly grocery lists as templates. One-click to add all your regular items and compare prices instantly. Never write another shopping list!",
  },
  {
    icon: Camera,
    color: "from-orange-500 to-red-500",
    title: "Scan Receipts & Earn Rewards",
    description: "Upload your receipts to help keep our prices accurate and earn points for every scan. Unlock exclusive rewards and gift cards!",
  },
];

const SAVINGS = [
  { label: "Weekly Groceries",  a: "$127", b: "$89",  save: "$38" },
  { label: "Monthly Bulk Buy",  a: "$234", b: "$170", save: "$64" },
  { label: "Organic Produce",   a: "$156", b: "$112", save: "$44" },
];

export default function Welcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem("welcomeShown", "true");
    navigate(createPageUrl("Browse"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">

          {/* AI Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full text-base font-semibold shadow-lg">
              <Cpu className="w-5 h-5" />
              The Evolution of Shopping with AI
            </span>
          </div>

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <TrendingDown className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              BasketSaver <span className="text-green-500">Compare</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-2">Stop Overpaying for Groceries</p>
            <p className="text-xl text-gray-500">
              Compare prices across 10 major stores and save up to{" "}
              <span className="font-bold text-blue-600">20–40% on every trip</span>
            </p>
          </div>

          {/* Store logos */}
          <div className="mb-12 bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-xl rounded-xl p-6">
            <p className="text-center text-sm font-semibold text-gray-600 mb-6 tracking-widest uppercase">
              We Compare Prices From:
            </p>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
              {STORES.map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-sm shadow-md hover:scale-110 transition-transform cursor-default"
                    style={{ backgroundColor: s.bg, color: s.text, fontSize: s.letter.length > 1 ? "11px" : "16px" }}
                  >
                    {s.letter}
                  </div>
                  <span className="text-xs font-medium text-gray-600 text-center leading-tight">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings examples */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Real Money You'll Save</h2>
            <p className="text-center text-gray-600 mb-8">See how much customers save on every shopping trip</p>
            <div className="grid md:grid-cols-3 gap-6">
              {SAVINGS.map((ex) => (
                <div key={ex.label} className="bg-white border-2 border-blue-300 rounded-xl p-6 hover:shadow-2xl transition-all">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">{ex.label}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between"><span className="text-gray-600">Store A:</span><span className="font-semibold">{ex.a}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Store B:</span><span className="font-semibold">{ex.b}</span></div>
                  </div>
                  <div className="border-t-2 border-blue-200 pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900">You Save:</span>
                    <span className="bg-blue-500 text-white text-lg font-bold px-4 py-1 rounded-full">{ex.save}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-xl">
                <p className="text-white text-2xl font-bold">
                  💰 Average Savings: <span className="text-3xl">$150+/month</span>
                </p>
                <p className="text-blue-100 text-sm mt-2">That's $1,800+ per year back in your pocket!</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How BasketSaver Works</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {FEATURES.map(({ icon: Icon, color, title, description }) => (
                <div key={title} className="bg-white border-2 border-gray-200 hover:border-green-300 rounded-xl p-6 hover:shadow-2xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                      <p className="text-gray-600">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Steps */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Start Saving in 3 Easy Steps</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { n: "1", color: "bg-blue-500",   border: "border-blue-200",   title: "Add Your Items",    desc: "Browse products or create your shopping list. Add everything you need to your cart." },
                { n: "2", color: "bg-green-500",  border: "border-green-200",  title: "Compare Instantly", desc: "See real-time price comparison across all 10 stores. Find the lowest total price in seconds." },
                { n: "3", color: "bg-purple-500", border: "border-purple-200", title: "Shop & Save",       desc: "Shop at the cheapest store or use pickup options. Save hundreds every month!" },
              ].map((step) => (
                <div key={step.n} className={`bg-white border-2 ${step.border} rounded-xl p-6 text-center`}>
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold`}>
                    {step.n}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus features */}
          <div className="mb-12 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bonus Features You'll Love</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Reusable Templates",   desc: "Save your weekly shopping lists and reuse them with one click" },
                { title: "Receipt Scanning",     desc: "Upload receipts to help keep prices up-to-date and earn rewards" },
                { title: "AI Real-Time Pricing", desc: "Get accurate, up-to-date prices across all stores powered by AI" },
                { title: "Rewards Program",      desc: "Earn points for scans and redeem for gift cards" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{f.title}</h4>
                    <p className="text-sm text-gray-600">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee */}
          <div className="mb-12 bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-400 rounded-xl p-8 text-center">
            <Award className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">100% Free — No Credit Card Required</h2>
            <p className="text-lg text-gray-700 mb-2">Start comparing prices immediately with zero commitment</p>
            <p className="text-sm text-gray-600">Average users save $47 on their very first shopping trip</p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleStart}
              className="w-full max-w-md inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl font-bold h-16 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 px-8"
            >
              <Sparkles className="w-6 h-6" />
              Get Started & Start Saving
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-gray-500 mt-4 text-sm">
              No credit card required · Free forever · Start saving immediately
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
