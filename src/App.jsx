import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import Cart from "./pages/Cart";
import PriceComparison from "./pages/PriceComparison";
import ScanProduct from "./pages/ScanProduct";
import BuyAgain from "./pages/BuyAgain";
import Templates from "./pages/Templates";
import Orders from "./pages/Orders";
import History from "./pages/History";
import Budget from "./pages/Budget";
import Pantry from "./pages/Pantry";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SplashScreen from "./components/SplashScreen";

function getUser() {
  try { return JSON.parse(localStorage.getItem("basketsaver_user")); } catch { return null; }
}

function HomeRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/Auth" replace />;
  if (!localStorage.getItem("welcomeShown")) return <Navigate to="/Welcome" replace />;
  return <Navigate to="/Browse" replace />;
}

export default function App() {
  const user = getUser();
  // Only show splash on very first ever visit (no user, no welcome flag)
  const [splashDone, setSplashDone] = useState(
    !!(user || localStorage.getItem("welcomeShown") || localStorage.getItem("basketsaver_users"))
  );

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

      <BrowserRouter>
        <Routes>
          {/* Auth — standalone */}
          <Route path="/Auth"    element={<Auth />} />
          <Route path="/Welcome" element={<Welcome />} />

          {/* Root smart redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* All app pages inside Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/Browse"          element={<Browse />} />
                <Route path="/Cart"            element={<Cart />} />
                <Route path="/PriceComparison" element={<PriceComparison />} />
                <Route path="/ScanProduct"     element={<ScanProduct />} />
                <Route path="/BuyAgain"        element={<BuyAgain />} />
                <Route path="/Templates"       element={<Templates />} />
                <Route path="/Orders"          element={<Orders />} />
              <Route path="/History"         element={<History />} />
              <Route path="/Budget"          element={<Budget />} />
              <Route path="/Pantry"          element={<Pantry />} />
              <Route path="/Profile"         element={<Profile />} />
              <Route path="/PrivacyPolicy"   element={<PrivacyPolicy />} />
              <Route path="/TermsOfService"  element={<TermsOfService />} />
                <Route path="*"               element={<Navigate to="/Browse" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
}
