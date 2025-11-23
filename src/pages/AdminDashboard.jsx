// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ec4899", "#8b5cf6", "#0ea5e9"];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    affiliateUrl: "",
    category: "",
    price: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); // "add" | "list" | "analytics"
  const [toast, setToast] = useState(""); // success toaster

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
    }
  }, [token, navigate]);

  const authAxios = axios.create({
    baseURL: `${API_BASE}/api`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const loadProducts = async () => {
  try {
    const res = await authAxios.get("/products/admin"); // 👈 NEW
    setProducts(res.data || []);
  } catch (err) {
    console.error("Error loading products:", err);
    alert("Failed to load products");
  }
};


  useEffect(() => {
    if (token) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      imageUrl: "",
      affiliateUrl: "",
      category: "",
      price: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    const isEdit = Boolean(editingId);

    try {
      const payload = {
        ...form,
        price:
          form.price === "" || form.price === null
            ? undefined
            : Number(form.price),
      };

      if (editingId) {
        await authAxios.put(`/products/${editingId}`, payload);
      } else {
        await authAxios.post("/products", payload);
      }

      resetForm();
      await loadProducts();
      showToast(isEdit ? "Product updated successfully" : "Product added successfully");
    } catch (err) {
      console.error("Save product error:", err);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      affiliateUrl: p.affiliateUrl || "",
      category: p.category || "",
      price: p.price ?? "",
      isActive: p.isActive ?? true,
    });
    setActiveTab("add"); // go to Add tab with filled form
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await authAxios.delete(`/products/${id}`);
      loadProducts();
      showToast("Product deleted");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // ---------- ANALYTICS ----------
  const analytics = useMemo(() => {
    if (!products.length) {
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        totalClicks: 0,
        perCategory: [],
      };
    }
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const inactiveProducts = totalProducts - activeProducts;
    const totalClicks = products.reduce((sum, p) => sum + (p.clicks || 0), 0);

    const categoryMap = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, clicks: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].clicks += p.clicks || 0;
    });

    const perCategory = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      ...data,
    }));

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalClicks,
      perCategory,
    };
  }, [products]);

  return (
    <div className="admin-page">
      {/* Top bar */}
      <div className="admin-top-row">
        <h2 className="admin-title">Admin Dashboard</h2>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-layout">
        {/* LEFT SIDEBAR MENU */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Menu</div>
          <button
            className={`admin-sidebar-item ${
              activeTab === "add" ? "admin-sidebar-item-active" : ""
            }`}
            onClick={() => setActiveTab("add")}
          >
            1. Add New Product
          </button>
          <button
            className={`admin-sidebar-item ${
              activeTab === "list" ? "admin-sidebar-item-active" : ""
            }`}
            onClick={() => setActiveTab("list")}
          >
            2. Product List
          </button>
          <button
            className={`admin-sidebar-item ${
              activeTab === "analytics" ? "admin-sidebar-item-active" : ""
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            3. Product Analytics
          </button>
        </aside>

        {/* RIGHT MAIN AREA */}
        <main className="admin-main">
          {/* TAB: ADD / EDIT PRODUCT – clean, wide layout */}
          {activeTab === "add" && (
            <div className="admin-card admin-form-card-wide">
              <div className="admin-card-header">
                <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
                {editingId && (
                  <span className="admin-badge-edit">Editing existing</span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="admin-form-wide">
                {/* Row 1: Title + Category + Price */}
                <div className="admin-row-three">
                  <label className="admin-label">
                    <span className="admin-field-title">Title</span>
                    <input
                      className="admin-input"
                      placeholder="Enter product title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      required
                    />
                  </label>

                  <label className="admin-label">
                    <span className="admin-field-title">Category</span>
                    <input
                      className="admin-input"
                      placeholder="e.g. Audio, Laptop, Course"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    />
                  </label>

                  <label className="admin-label">
                    <span className="admin-field-title">Price (USD)</span>
                    <input
                      className="admin-input"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 49.99"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                  </label>
                </div>

                {/* Row 2: Image URL */}
                <label className="admin-label admin-label-full">
                  <span className="admin-field-title">Image URL</span>
                  <input
                    className="admin-input"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                  />
                  {form.imageUrl && (
                    <div className="admin-image-preview-wrapper">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="admin-image-preview"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </label>

                {/* Row 3: Affiliate URL */}
                <label className="admin-label admin-label-full">
                  <span className="admin-field-title">Affiliate URL</span>
                  <input
                    className="admin-input"
                    placeholder="Affiliate link from Amazon, Flipkart, etc."
                    value={form.affiliateUrl}
                    onChange={(e) =>
                      setForm({ ...form, affiliateUrl: e.target.value })
                    }
                    required
                  />
                </label>

                {/* Row 4: Description */}
                <label className="admin-label admin-label-full">
                  <span className="admin-field-title">Description</span>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    placeholder="Short description of the product..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>

                {/* Row 5: Active + Cancel / Save */}
                <div className="admin-row-bottom">
                  <label className="admin-label admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                    />
                    Active
                  </label>

                  <div className="admin-actions-right">
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      className="admin-button"
                      type="submit"
                      disabled={loading}
                    >
                      {loading
                        ? "Saving..."
                        : editingId
                        ? "Update Product"
                        : "Create Product"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB: PRODUCT LIST */}
          {activeTab === "list" && (
            <div className="admin-card">
              <h3>Product List</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price (USD)</th>
                      <th>Clicks</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, index) => (
                      <tr key={p._id}>
                        <td>{index + 1}</td>
                        <td>{p.title}</td>
                        <td>{p.category || "-"}</td>
                        <td>
                          {p.price !== undefined && p.price !== null
                            ? `$${p.price}`
                            : "-"}
                        </td>
                        <td>{p.clicks}</td>
                        <td>{p.isActive ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="admin-table-btn"
                            onClick={() => handleEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-table-btn admin-table-btn-danger"
                            onClick={() => handleDelete(p._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {products.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          No products yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PRODUCT ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="admin-analytics">
              {/* Overview cards */}
              <div className="admin-card">
                <h3>Overview</h3>
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <div className="analytics-label">Total Products</div>
                    <div className="analytics-value">
                      {analytics.totalProducts}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-label">Active Products</div>
                    <div className="analytics-value">
                      {analytics.activeProducts}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-label">Inactive Products</div>
                    <div className="analytics-value">
                      {analytics.inactiveProducts}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-label">Total Clicks</div>
                    <div className="analytics-value">
                      {analytics.totalClicks}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie chart + table for categories */}
              <div className="admin-card">
                <h3>Clicks by Category</h3>

                {analytics.perCategory.length === 0 ? (
                  <p className="info-text">No data yet.</p>
                ) : (
                  <div className="analytics-layout">
                    {/* Pie chart – using clicks */}
                    <div className="analytics-chart">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={analytics.perCategory}
                            dataKey="clicks" // clicks per category
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            labelLine={false}
                            label={(entry) =>
                              `${entry.name} (${entry.clicks})`
                            }
                          >
                            {analytics.perCategory.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Category table */}
                    <div className="analytics-table">
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Products</th>
                              <th>Total Clicks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.perCategory.map((c) => (
                              <tr key={c.name}>
                                <td>{c.name}</td>
                                <td>{c.count}</td>
                                <td>{c.clicks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SUCCESS TOAST */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}
