import React from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProductCard({ product }) {
  const handleClick = () => {
    window.location.href = `${API_BASE}/api/products/${product._id}/redirect`;
  };

  return (
    <div className="product-card">
      {product.imageUrl && (
        <div className="product-image-wrapper">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="product-image"
          />
        </div>
      )}

      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>

        {product.category && (
          <span className="product-category-pill">{product.category}</span>
        )}

        {product.price && (
          <div className="product-price">
            ${product.price}
            <span className="product-price-label"> Best Price</span>
          </div>
        )}

        {product.description && (
          <p className="product-description">
            {product.description.length > 90
              ? product.description.slice(0, 90) + "..."
              : product.description}
          </p>
        )}

        <button className="product-button" onClick={handleClick}>
          View Deal
        </button>
      </div>
    </div>
  );
}
