// src/pages/Referrals.jsx
// Referral codes generated from a local UUID stored in localStorage.
// Share via clipboard or native share sheet. No backend needed.

import { useState, useEffect } from "react";
import { Users, Copy, Check, Mail, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const REFERRALS_KEY  = "basketsaver_referrals";
const USER_CODE_KEY  = "basketsaver_ref_code";
const REWARDS_KEY    = "basketsaver_rewards";

function getOrCreateCode() {
  let code = localStorage.getItem(USER_CODE_KEY);
  if (!code) {
    // Generate a short alphanumeric code
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem(USER_CODE_KEY, code);
  }
  return code;
}

function getReferrals() {
  return JSON.parse(localStorage.getItem(REFERRALS_KEY) || "[]");
}

function addPoints(amount) {
  const r = JSON.parse(localStorage.getItem(REWARDS_KEY) || "{}");
  r.total_points = (r.total_points || 0) + amount;
  localStorage.setItem(REWARDS_KEY, JSON.stringify(r));
}

export default function Referrals() {
  const [code, setCode]           = useState("");
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied]       = useState(false);
  const [emailTo, setEmailTo]     = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [testCode, setTestCode]   = useState("");
  const [testMsg, setTestMsg]     = useState("");

  useEffect(() => {
    setCode(getOrCreateCode());
    setReferrals(getReferrals());
  }, []);

  const referralLink = `${window.location.origin}?ref=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Save money on groceries with BasketSaver!",
        text: `Use my referral link to compare grocery prices across 10 stores and save up to 40%!`,
        url: referralLink,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleEmailShare = (e) => {
    e.preventDefault();
    if (!emailTo.trim()) return;
    // On mobile this opens the mail app; on desktop it may prompt
    window.location.href = `mailto:${emailTo}?subject=Save money on groceries!&body=Hey! I've been using BasketSaver to save money at the grocery store. Use my link to get started: ${referralLink}`;
    setEmailSent(true);
    setEmailTo("");
    setTimeout(() => setEmailSent(false), 3000);
  };

  // Simulate redeeming a referral code someone gave you
  const handleRedeemCode = (e) => {
    e.preventDefault();
    const input = testCode.trim().toUpperCase();
    if (!input) return;
    if (input === code) { setTestMsg("That's your own code!"); return; }

    const existing = getReferrals();
    if (existing.find((r) => r.code === input)) {
      setTestMsg("You've already used this code.");
      return;
    }

    const updated = [...existing, { code: input, used_at: new Date().toISOString(), bonus: 50 }];
    localStorage.setItem(REFERRALS_KEY, JSON.stringify(updated));
    addPoints(50);
    setReferrals(updated);
    setTestMsg("✓ Code applied! +50 points added to your Rewards.");
    setTestCode("");
    setTimeout(() => setTestMsg(""), 4000);
  };

  const pending  = referrals.filter((r) => !r.completed).length;
  const completed = referrals.filter((r) => r.completed).length;
  const totalEarned = referrals.reduce((s, r) => s + (r.bonus || 50), 0);

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-10 max-w-3xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" /> Referral Program
        </h1>
        <p className="text-gray-600">Share BasketSaver and earn 50 points for every friend who joins</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Referrals", val: referrals.length, color: "text-blue-600" },
          { label: "Points Earned",   val: totalEarned,      color: "text-green-600" },
          { label: "Completed",       val: completed,        color: "text-purple-600" },
        ].map((s) => (
          <Card key={s.label} className="border border-gray-200 text-center">
            <CardContent className="p-4">
              <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Your referral link */}
      <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Your Referral Link</CardTitle>
          <CardDescription>Share this link to earn 50 points per signup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 bg-white border border-blue-300 rounded-xl px-4 py-3">
            <span className="flex-1 text-sm text-gray-700 truncate font-mono">{referralLink}</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${
                copied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Gift className="w-4 h-4" /> Share Now
            </button>
          </div>

          {/* Email share */}
          <form onSubmit={handleEmailShare} className="flex gap-2">
            <input
              type="email"
              placeholder="Friend's email address"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              <Mail className="w-4 h-4" />
              {emailSent ? "Sent!" : "Send"}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: "1", text: "Share your unique referral link with friends and family" },
              { step: "2", text: "They sign up and start comparing grocery prices" },
              { step: "3", text: "You earn 50 reward points for each person who joins" },
              { step: "4", text: "Redeem points for gift cards and premium features" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {s.step}
                </div>
                <p className="text-gray-700">{s.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redeem a friend's code */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg">Have a Friend's Code?</CardTitle>
          <CardDescription>Enter their referral code to give them +50 points</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRedeemCode} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter referral code (e.g. ABC12345)"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Apply
            </button>
          </form>
          {testMsg && <p className={`mt-2 text-sm font-medium ${testMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>{testMsg}</p>}
        </CardContent>
      </Card>

      {/* Referral history */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 font-mono text-sm">{r.code}</p>
                    <p className="text-xs text-gray-400">{new Date(r.used_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className="bg-green-500 text-white">+{r.bonus || 50} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
