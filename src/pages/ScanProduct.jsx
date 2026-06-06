// src/pages/ScanProduct.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Package, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, getUserId } from "@/lib/supabase";

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find((i) => i.product_id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      product_id:   product.id || `scan-${Date.now()}`,
      product_name: product.name,
      price:        product.price || 0,
      category:     product.category || "Pantry",
      quantity:     1,
      total:        product.price || 0,
      estimated_prices: null,
    });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

async function analyzeImage(base64Data, mediaType, mode) {
  const response = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Data, mediaType, mode })
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  if (data._debug) throw new Error(data._debug);
  return data;
}

async function saveReceiptToSupabase(parsed, userId) {
  try {
    // Save receipt header
    const { data: receipt, error: receiptError } = await supabase
      .from("receipts")
      .insert({
        user_id:      userId,
        store_name:   parsed.store_name || null,
        scan_date:    parsed.receipt_date || new Date().toISOString().split("T")[0],
        total_amount: parsed.receipt_total || null,
      })
      .select()
      .single();

    if (receiptError) throw receiptError;

    // Save individual items
    const items = (parsed.items || []).map((item) => ({
      receipt_id: receipt.id,
      user_id:    userId,
      name:       item.name,
      price:      item.price || 0,
      quantity:   item.quantity || 1,
      category:   item.category || "Pantry",
    }));

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("receipt_items").insert(items);
      if (itemsError) throw itemsError;
    }

    return receipt.id;
  } catch (err) {
    console.error("Supabase save error:", err);
    return null;
  }
}

async function saveProductToSupabase(product, userId) {
  try {
    await supabase.from("receipt_items").insert({
      user_id:  userId,
      name:     product.name,
      price:    product.price || 0,
      quantity: 1,
      category: product.category || "Pantry",
    });
  } catch (err) {
    console.error("Supabase save error:", err);
  }
}

export default function ScanProduct() {
  const navigate = useNavigate();
  const fileInputRef    = useRef(null);
  const productInputRef = useRef(null);

  const [mode, setMode]                   = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [results, setResults]             = useState([]);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(false);
  const [addedIds, setAddedIds]           = useState({});
  const [savedToDb, setSavedToDb]         = useState(false);

  const handleFileSelect = async (e, scanMode) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMode(scanMode);
    setPreviewUrl(URL.createObjectURL(file));
    setResults([]);
    setError(null);
    setSuccess(false);
    setSavedToDb(false);
    setIsProcessing(true);

    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      const mediaType = file.type || "image/jpeg";
      const parsed = await analyzeImage(base64, mediaType, scanMode);
      const userId = getUserId();

      if (scanMode === "receipt") {
        const items = parsed.items || [];
        setResults(items);
        setSuccess(true);
        // Save to Supabase in background
        saveReceiptToSupabase(parsed, userId).then((id) => {
          if (id) setSavedToDb(true);
        });
        // Also save to localStorage for offline history
        const history = JSON.parse(localStorage.getItem("bs_purchase_history") || "[]");
        history.push({
          id: Date.now().toString(),
          date: parsed.receipt_date || new Date().toISOString(),
          store: parsed.store_name || "Unknown Store",
          items: items.map(i => ({ ...i, product_name: i.name, product_id: `scan-${Date.now()}-${Math.random()}` })),
          total: parsed.receipt_total || items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0),
          saved: 0,
        });
        localStorage.setItem("bs_purchase_history", JSON.stringify(history));
      } else {
        const product = Array.isArray(parsed) ? parsed[0] : parsed;
        setResults([product]);
        setSuccess(true);
        saveProductToSupabase(product, userId);
      }
    } catch (err) {
      console.error("Scan error:", err);
      setError(
        err.message?.includes("API error")
          ? "Could not connect to AI service. Please check your internet connection and try again."
          : "Could not read the image. Make sure it's a clear photo and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = (item, idx) => {
    addToCart({
      id:       `scan-${Date.now()}-${idx}`,
      name:     item.name,
      price:    item.price || 0,
      category: item.category || "Pantry",
    });
    setAddedIds((prev) => ({ ...prev, [idx]: true }));
  };

  const handleReset = () => {
    setMode(null);
    setPreviewUrl(null);
    setResults([]);
    setError(null);
    setSuccess(false);
    setSavedToDb(false);
    setAddedIds({});
    if (fileInputRef.current)    fileInputRef.current.value = "";
    if (productInputRef.current) productInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-10 max-w-2xl">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Camera className="w-6 h-6 text-blue-600" /> Scan Products & Receipts
        </h1>
        <p className="text-gray-500 text-sm">
          AI-powered scanning — add items to your cart and track your spending
        </p>
      </div>

      {/* Mode selector */}
      {!previewUrl && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "receipt")}
            />
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 rounded-2xl p-6 text-center transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Scan Receipt</h3>
              <p className="text-xs text-gray-500">Extract all items and track your spending</p>
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              ref={productInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "product")}
            />
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-6 text-center transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Scan Product</h3>
              <p className="text-xs text-gray-500">Photo a product to identify and add to cart</p>
            </div>
          </label>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="font-semibold text-blue-900 text-lg">
              {mode === "receipt" ? "Reading your receipt..." : "Identifying product..."}
            </p>
            <p className="text-blue-500 text-sm mt-1">AI is analyzing your image</p>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewUrl && !isProcessing && (
        <div className="mb-4">
          <img src={previewUrl} alt="Scanned" className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Success + results */}
      {success && results.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">
                Found {results.length} item{results.length !== 1 ? "s" : ""}
                {savedToDb && <span className="text-xs text-gray-400 ml-2">· saved to your history</span>}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {results.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                  🛒
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.category || "Pantry"}{item.size ? ` · ${item.size}` : ""}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-blue-600 font-bold text-sm">${(item.price || 0).toFixed(2)}</p>
                  {item.quantity > 1 && <p className="text-xs text-gray-400">×{item.quantity}</p>}
                </div>
                <button
                  onClick={() => handleAddToCart(item, i)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                    addedIds[i]
                      ? "bg-green-500 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {addedIds[i] ? "✓" : <><Plus className="w-3 h-3" />Add</>}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate(createPageUrl("Cart"))}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              View Cart
            </button>
            <button
              onClick={handleReset}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}

      {success && results.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700 mb-1">No items detected</p>
          <p className="text-sm text-gray-500 mb-4">Try a clearer photo with better lighting</p>
          <button onClick={handleReset} className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
