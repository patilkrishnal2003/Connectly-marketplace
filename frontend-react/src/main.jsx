import React, { useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import ScrollToTop from "./components/ScrollToTop";
import DealDetail from "./pages/DealDetail";
import MyDeals from "./pages/MyDeals";
import Payment from "./pages/Payment";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Contact from "./pages/Contact";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Changelog from "./pages/Changelog";
import Roadmap from "./pages/Roadmap";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Documentation from "./pages/Documentation";
import Community from "./pages/Community";
import Api from "./pages/Api";
import CookiePolicy from "./pages/CookiePolicy";
import Security from "./pages/Security";
import Legal from "./pages/Legal";
import { AuthProvider, AuthContext } from "./auth/AuthProvider";
import "./index.css";

function AdminRoute({ children }) {
  const { user, token } = useContext(AuthContext);
  if (!token) return <Navigate to="/" replace />;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/success" element={<Payment />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route path="/my-deals" element={<MyDeals />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/community" element={<Community />} />
            <Route path="/api" element={<Api />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/security" element={<Security />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/deal/:dealId" element={<DealDetail />} />
            <Route path="/*" element={<App />} />
          </Routes>
        </ScrollToTop>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
