// src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <div className="app-root">
      {/* Header with search (visible on all pages) */}
      <header className="main-header">
        <div className="logo-simple">
          <span className="logo-main">US Gadgets</span>
          <span className="logo-tagline">Affiliate Deals</span>
        </div>

        <div className="header-search-wrapper">
          <input
            className="header-search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage searchTerm={search} />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}
