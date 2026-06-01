// src/pages/Auth.jsx
// Real Supabase authentication — email/password signup + signin + Google OAuth
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff, ArrowRight, ShoppingBag, Cpu, CheckCircle2, TrendingDown } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PERKS = [
  "Compare prices across 10 major grocery stores",
  "AI finds the cheapest store for your whole cart",
  "Save up to 40% on every grocery trip",
  "Scan receipts to improve price accuracy",
  "Save & reuse your shopping lists",
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode]         = useState("signup");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirm, setConfirm]   = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://basketsaver-two.vercel.app/Browse",
      },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
    // On success, browser redirects — no need to setGoogleLoading(false)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim())          { setError("Please enter your name");                setLoading(false); return; }
        if (!email.includes("@")) { setError("Please enter a valid email");             setLoading(false); return; }
        if (password.length < 6)  { setError("Password must be at least 6 characters"); setLoading(false); return; }

        const { data, error: err } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });

        if (err) { setError(err.message); setLoading(false); return; }

        localStorage.setItem("basketsaver_user", JSON.stringify({
          id:    data.user?.id,
          name:  name.trim(),
          email: email.toLowerCase().trim(),
        }));
        localStorage.setItem("welcomeShown", "true");

        if (data.session) {
          navigate(createPageUrl("Browse"));
        } else {
          setConfirm(true);
        }

      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email:    email.toLowerCase().trim(),
          password,
        });

        if (err) { setError(err.message); setLoading(false); return; }

        localStorage.setItem("basketsaver_user", JSON.stringify({
          id:    data.user?.id,
          name:  data.user?.user_metadata?.full_name || email.split("@")[0],
          email: data.user?.email,
        }));
        localStorage.setItem("welcomeShown", "true");
        navigate(createPageUrl("Browse"));
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleGuest = () => {
    localStorage.setItem("basketsaver_user", JSON.stringify({ id: "guest", name: "Guest", email: "" }));
    localStorage.setItem("welcomeShown", "true");
    navigate(createPageUrl("Browse"));
  };

  if (confirm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
          <p className="text-gray-500 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account then come back and sign in.
          </p>
          <button
            onClick={() => { setConfirm(false); setMode("signin"); }}
            className="w-full h-12 font-bold rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #4f46e5)" }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">

      {/* Left panel */}
      <div
        className="hidden md:flex md:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/30 border border-blue-400/40 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none" style={{ fontFamily: "Georgia, serif" }}>
                BasketSaver
              </p>
              <p className="text-blue-400 text-[10px] tracking-widest uppercase">AI-Powered Grocery Savings</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6 w-fit">
            <Cpu className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-200 text-xs font-semibold tracking-widest uppercase">
              The Evolution of Shopping with AI
            </span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Stop Overpaying<br />for Groceries
          </h2>
          <p className="text-blue-200 text-base mb-8">
            Let AI find the cheapest store for your exact shopping list — every single trip.
          </p>
          <div className="space-y-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500/20 border border-green-400/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-blue-100 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-white font-black text-2xl">$150+ <span className="text-yellow-300 text-lg">/month</span></p>
          <p className="text-blue-200 text-sm">Average savings for BasketSaver users</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white min-h-screen md:min-h-0">

        <div className="md:hidden text-center mb-8 w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span className="text-blue-500 text-xs font-bold tracking-widest uppercase">
              The Evolution of Shopping with AI
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
            BasketSaver
          </h1>
          <p className="text-gray-500 text-sm mt-1">AI-Powered Grocery Savings</p>
          <p className="text-gray-400 text-xs mt-0.5">Stop Overpaying for Groceries</p>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {mode === "signup"
              ? "Join thousands of smart shoppers saving money every trip"
              : "Sign in to access your saved lists and cart"}
          </p>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-12 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-sm mb-4 disabled:opacity-70"
          >
            {googleLoading
              ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <><GoogleIcon /> Continue with Google</>
            }
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {["signup", "signin"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "signup" ? "Create Account" : "Sign In"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text" placeholder="Jane Smith" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" placeholder="jane@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-white shadow-lg mt-2"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #4f46e5)" }}
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>{mode === "signup" ? "Start Saving Money" : "Sign In"} <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button onClick={handleGuest}
            className="w-full h-12 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue as Guest
          </button>

          <p className="text-center text-xs text-gray-400 mt-5">
            By continuing you agree to our{" "}
            <span className="text-blue-500 cursor-pointer hover:underline">Terms</span>
            {" & "}
            <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
