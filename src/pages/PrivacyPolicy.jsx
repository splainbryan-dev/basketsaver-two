// src/pages/PrivacyPolicy.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Last updated: May 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>BasketSaver collects the following information to provide and improve our service:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Account information:</strong> Name and email address when you create an account.</li>
              <li><strong>Shopping data:</strong> Products you search for, add to your cart, and purchase history you choose to record.</li>
              <li><strong>Receipt scan data:</strong> When you scan receipts, we process the image to extract product and price information using AI. Images are not permanently stored.</li>
              <li><strong>Location data:</strong> General region (not precise location) to provide relevant store comparisons.</li>
              <li><strong>Usage data:</strong> How you interact with the app to improve features.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide grocery price comparisons across stores</li>
              <li>To improve our pricing algorithm accuracy</li>
              <li>To generate anonymized regional shopping trend data</li>
              <li>To send price alerts and notifications (with your permission)</li>
              <li>To provide personalized shopping recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data Sharing</h2>
            <p>We may share <strong>anonymized, aggregated</strong> shopping trend data with consumer goods companies and retailers. This data cannot be used to identify you personally. We never sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Data Storage</h2>
            <p>Your personal data (cart, lists, pantry) is stored locally on your device. Account information is stored securely on our servers. You can delete all local data at any time from Profile → Clear App Data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Kroger API:</strong> For real-time product and price data</li>
              <li><strong>Anthropic Claude API:</strong> For AI-powered receipt scanning</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Contact us at splainbryan@gmail.com to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Contact</h2>
            <p>Questions about this policy? Contact us at <span className="text-blue-600">splainbryan@gmail.com</span></p>
          </section>
        </div>
      </div>
    </div>
  );
}
