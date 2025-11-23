// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Static banner slides
const BANNERS = [
  {
    id: 1,
    title: "Top Gadget Deals",
    subtitle: "Latest offers from our trusted affiliate partners.",
    image:
      "https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    title: "Work From Home Essentials",
    subtitle: "Upgrade your setup with curated accessories.",
    image:
      "https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    title: "Courses & Software Tools",
    subtitle: "Learn and grow with the best online resources.",
    image:
      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

function BannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % BANNERS.length),
      4000
    );
    return () => clearInterval(id);
  }, []);

  const current = BANNERS[index];

  return (
    <div className="banner-carousel">
      <div className="banner-slide">
        <img src={current.image} alt={current.title} className="banner-image" />
        <div className="banner-overlay" />
        <div className="banner-text">
          <h2>{current.title}</h2>
          <p>{current.subtitle}</p>
        </div>
      </div>

      <div className="banner-dots">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            className={`banner-dot ${i === index ? "banner-dot-active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ searchTerm }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/products`);
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // categories menu
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.category && set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  // apply category + search filter
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="home">
      {/* MENU BAR */}
      <section className="menu-section">
        <div className="menu-label">Categories</div>
        <div className="menu-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`menu-item ${
                selectedCategory === cat ? "menu-item-active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* FULL-WIDTH BANNER */}
      <section className="banner-section">
        <BannerCarousel />
      </section>

      {/* PRODUCTS – FULL WIDTH grid */}
      <section className="products-section">
        <div className="products-header-row">
          <h2>Products</h2>
          {!loading && (
            <span className="products-count">
              {filteredProducts.length} item
              {filteredProducts.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        {loading && <p className="info-text">Loading products...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="info-text">
            No products found. Try a different category or search.
          </p>
        )}

        <div className="products-grid">
          {filteredProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
