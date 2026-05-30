// src/pages/Rewards.jsx
// Points system stored in localStorage key "basketsaver_rewards".
// Points are awarded by ScanProduct.jsx and Cart.jsx.
// No Base44, no backend needed.

import { useState, useEffect } from "react";
import { Trophy, Gift, Star, Zap, Crown, Award, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Reward catalog ──────────────────────────────────────────────
const CATALOG = [
  { id: "gift_5",        name: "$5 Gift Card",              desc: "Choose from Walmart, Target, Kroger, or Amazon", points: 500,  value: "$5",   popular: false, icon: Gift  },
  { id: "gift_10",       name: "$10 Gift Card",             desc: "Choose from Walmart, Target, Kroger, or Amazon", points: 900,  value: "$10",  popular: true,  icon: Gift  },
  { id: "gift_25",       name: "$25 Gift Card",             desc: "Choose from Walmart, Target, Kroger, or Amazon", points: 2000, value: "$25",  popular: true,  icon: Gift  },
  { id: "gift_50",       name: "$50 Gift Card",             desc: "Choose from Walmart, Target, Kroger, or Amazon", points: 3800, value: "$50",  popular: false, icon: Gift  },
  { id: "premium_month", name: "Premium Features (1 Month)",desc: "Price alerts, historical tracking, personalized deals", points: 1000, value: "$9.99", popular: false, icon: Star },
];

// ── Level system ────────────────────────────────────────────────
const LEVELS = {
  bronze:   { name: "Bronze",   min: 0,    color: "from-amber-700  to-amber-500",  icon: Award,  benefits: ["Basic price comparisons", "Shopping templates", "Price history (7 days)"] },
  silver:   { name: "Silver",   min: 200,  color: "from-gray-400   to-gray-300",   icon: Star,   benefits: ["All Bronze benefits", "Price drop alerts", "Price history (30 days)", "Priority support"] },
  gold:     { name: "Gold",     min: 500,  color: "from-yellow-500 to-amber-400",  icon: Trophy, benefits: ["All Silver benefits", "Advanced analytics", "Price predictions", "Exclusive deals"] },
  platinum: { name: "Platinum", min: 1000, color: "from-purple-500 to-indigo-500", icon: Crown,  benefits: ["All Gold benefits", "API access", "Dedicated support", "Beta features"] },
};

// ── Helpers ─────────────────────────────────────────────────────
const REWARDS_KEY = "basketsaver_rewards";

function getRewards() {
  return JSON.parse(localStorage.getItem(REWARDS_KEY) || JSON.stringify({
    total_points: 0,
    receipts_scanned: 0,
    products_contributed: 0,
    badges: [],
    redemptions: [],
    level: "bronze",
  }));
}

function saveRewards(r) {
  // Recalculate level
  const pts = r.total_points;
  r.level = pts >= 1000 ? "platinum" : pts >= 500 ? "gold" : pts >= 200 ? "silver" : "bronze";
  localStorage.setItem(REWARDS_KEY, JSON.stringify(r));
  return r;
}

function getCurrentLevel(points) {
  if (points >= 1000) return "platinum";
  if (points >= 500)  return "gold";
  if (points >= 200)  return "silver";
  return "bronze";
}

function getNextLevel(current) {
  const order = ["bronze", "silver", "gold", "platinum"];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

// ── Component ────────────────────────────────────────────────────
export default function Rewards() {
  const [rewards, setRewards] = useState(getRewards());
  const [selected, setSelected] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  // Refresh from localStorage on mount
  useEffect(() => { setRewards(getRewards()); }, []);

  const handleRedeem = (item) => {
    setSelected(item);
    setRedeemSuccess(false);
    setShowDialog(true);
  };

  const confirmRedeem = () => {
    if (!selected) return;
    const r = getRewards();
    if (r.total_points < selected.points) return;
    r.total_points -= selected.points;
    r.redemptions = r.redemptions || [];
    r.redemptions.push({ ...selected, redeemed_at: new Date().toISOString() });
    setRewards(saveRewards(r));
    setRedeemSuccess(true);
    setTimeout(() => { setShowDialog(false); setRedeemSuccess(false); setSelected(null); }, 2500);
  };

  const pts   = rewards.total_points;
  const level = getCurrentLevel(pts);
  const next  = getNextLevel(level);
  const levelInfo = LEVELS[level];
  const LevelIcon = levelInfo.icon;
  const nextInfo  = next ? LEVELS[next] : null;
  const ptsToNext = next ? LEVELS[next].min - pts : 0;
  const progress  = next ? Math.round((pts / LEVELS[next].min) * 100) : 100;

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-10 max-w-5xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" /> Rewards & Points
        </h1>
        <p className="text-gray-600">Earn points by scanning receipts and redeem for gift cards</p>
      </div>

      {/* Points card + stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className={`bg-gradient-to-br ${levelInfo.color} text-white overflow-hidden relative`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Your Points</p>
                <p className="text-5xl font-bold">{pts}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <LevelIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {levelInfo.name} Member
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Your Stats</h3>
            <div className="space-y-4">
              {[
                { label: "Receipts Scanned",   val: rewards.receipts_scanned || 0 },
                { label: "Products Added",     val: rewards.products_contributed || 0 },
                { label: "Rewards Redeemed",   val: (rewards.redemptions || []).length },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-bold text-xl">{s.val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to next level */}
      {next && (
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Progress to {nextInfo.name}</p>
                <p className="font-semibold text-gray-900">{ptsToNext} points to go!</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${nextInfo.color} rounded-full flex items-center justify-center`}>
                <nextInfo.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {nextInfo.benefits.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" /> {b}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current benefits */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your {levelInfo.name} Benefits</CardTitle>
          <CardDescription>Enjoy these perks as a {levelInfo.name} member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {levelInfo.benefits.map((b) => (
              <div key={b} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{b}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reward catalog */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Redeem Your Points</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATALOG.map((item) => {
            const Icon = item.icon;
            const canAfford = pts >= item.points;
            return (
              <div key={item.id} className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all ${item.popular ? "border-yellow-400" : "border-gray-200"}`}>
                {item.popular && (
                  <div className="bg-yellow-400 text-center py-1">
                    <span className="text-xs font-bold text-gray-900">⭐ POPULAR</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600">Value: <span className="font-bold text-green-600">{item.value}</span></span>
                    <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-xs">{item.points} pts</span>
                  </div>
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                      canAfford
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {canAfford ? "Redeem Now" : `Need ${item.points - pts} more pts`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> How to Earn More Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { pts: "+10", desc: "Per product scanned" },
              { pts: "+50", desc: "Per receipt uploaded" },
              { pts: "+100", desc: "Profile completion bonus" },
            ].map((e) => (
              <div key={e.desc} className="bg-white p-4 rounded-xl">
                <div className="font-bold text-lg text-green-600 mb-1">{e.pts} points</div>
                <p className="text-sm text-gray-600">{e.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redemption dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {redeemSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Redeemed!</h3>
                <p className="text-gray-600">Your reward will be emailed within 24–48 hours.</p>
              </div>
            ) : selected && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Confirm Redemption</h2>
                <p className="text-gray-500 text-sm mb-4">Are you sure you want to redeem this reward?</p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="font-bold text-gray-900 mb-1">{selected.name}</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-gray-600">Points cost:</span><span className="font-semibold text-red-500">−{selected.points}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Current balance:</span><span className="font-semibold">{pts}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="font-bold">New balance:</span><span className="font-bold text-green-600">{pts - selected.points}</span></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">Reward will be sent to your email within 24–48 hours.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDialog(false)} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button onClick={confirmRedeem} className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold">Confirm</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
