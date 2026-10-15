
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number | string;
  quantity: number;
  low_stock_threshold: number;
};

type ProductForm = {
  name: string;
  category: string;
  price: string;
  quantity: string;
  low_stock_threshold: string;
};

const emptyForm: ProductForm = {
  name: "",
  category: "",
  price: "",
  quantity: "",
  low_stock_threshold: "5",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "danger">(
    "success"
  );
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("all");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(data.products);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  
useEffect(() => {
  let cancelled = false;

  async function checkLogin() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        window.location.replace("/login");
        return;
      }

      if (!cancelled) {
        await loadProducts();
      }
    } catch {
      window.location.replace("/login");
    }
  }

  void checkLogin();

  return () => {
    cancelled = true;
  };
}, [loadProducts]);


  function openAddForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      low_stock_threshold: String(product.low_stock_threshold),
    });
    setNotice("");
    setShowForm(true);
  }

  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    const productData = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
    };

    try {
      const isEditing = editingProduct !== null;

      const response = await fetch(
        isEditing
          ? `/api/products/${editingProduct.id}`
          : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save product.");
      }

      setNotice(
        data.message ||
          (isEditing ? "Product updated!" : "Product added!")
      );
      setNoticeType("success");
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);

      await loadProducts();
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Unable to save product."
      );
      setNoticeType("danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setNotice("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete product.");
      }

      setNotice(data.message || "Product deleted successfully!");
      setNoticeType("success");
      await loadProducts();
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Unable to delete product."
      );
      setNoticeType("danger");
    } finally {
      setDeletingId(null);
    }
  }

  
async function handleLogout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Logout failed.");
    }

    window.location.assign("/login");
  } catch {
    setNotice("Unable to log out. Please try again.");
    setNoticeType("danger");
  }
}


  const totalStock = products.reduce(
    (total, product) => total + Number(product.quantity),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.quantity) <= Number(product.low_stock_threshold)
  ).length;

  const categories = Array.from(
  new Set(products.map((product) => product.category))
).sort();

const filteredProducts = products.filter((product) => {
  const matchesSearch =
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

  const matchesCategory =
    selectedCategory === "all" ||
    product.category === selectedCategory;

  return matchesSearch && matchesCategory;
});

  return (
    <div className="d-flex min-vh-100 bg-light">
      <aside
        className="bg-dark text-white p-4 d-none d-lg-flex flex-column"
        style={{ width: "250px" }}
      >
        <h3 className="fw-bold mb-1">StockWise</h3>
        <p className="text-secondary small">Inventory Management</p>
        <hr className="border-secondary" />

        <div className="rounded bg-primary p-3 mb-2">
          ▦ &nbsp; Dashboard
        </div>
        <div className="p-3 text-white-50">▤ &nbsp; Products</div>
        <div className="p-3 text-white-50">◉ &nbsp; Reports</div>

        <div className="mt-auto small text-secondary">StockWise v1.0</div>
      </aside>

      <main className="flex-grow-1 p-3 p-md-4 p-xl-5">
        <header className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Dashboard</h2>
            <p className="text-secondary mb-0">
              Manage your products and stock levels.
            </p>
          </div>


<div className="d-flex flex-wrap gap-2">
  <button
    className="btn btn-outline-danger"
    type="button"
    onClick={handleLogout}
  >
    Logout
  </button>

  <button
    className="btn btn-primary px-4"
    type="button"
    onClick={() => (showForm ? setShowForm(false) : openAddForm())}
  >
    {showForm ? "Close Form" : "+ Add Product"}
  </button>
</div>


       
        </header>

        {notice && (
          <div className={`alert alert-${noticeType}`} role="alert">
            {notice}
          </div>
        )}

        {showForm && (
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h5>

              <form onSubmit={handleSaveProduct}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Product Name</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Category</label>
                    <input
                      className="form-control"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="1"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Low Stock Threshold</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="1"
                      value={form.low_stock_threshold}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          low_stock_threshold: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingProduct
                        ? "Update Product"
                        : "Save Product"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={saving}
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setForm(emptyForm);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <p className="text-secondary mb-2">Total Products</p>
                <h2 className="fw-bold">{products.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <p className="text-secondary mb-2">Total Stock Units</p>
                <h2 className="fw-bold">{totalStock}</h2>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <p className="text-secondary mb-2">Low Stock Alerts</p>
                <h2 className="fw-bold text-danger">{lowStock}</h2>
              </div>
            </div>
          </div>
        </div>

        <section className="card border-0 shadow-sm">
          <div className="card-body p-3 p-md-4">
          
          
<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
  <h5 className="fw-bold mb-0">Products</h5>

  <div className="d-flex flex-column flex-sm-row gap-2">
    <input
      type="search"
      className="form-control"
      placeholder="Search products..."
      aria-label="Search products"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />

    <select
      className="form-select"
      aria-label="Filter by category"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
    >
      <option value="all">All Categories</option>

      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>
</div>


            {loading && <p>Loading products...</p>}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && products.length === 0 && (
              <div className="alert alert-info">
                No products found. Add your first product to get started.
              </div>
            )}


            {!loading && !error &&
  products.length > 0 &&
  filteredProducts.length === 0 && (
    <div className="alert alert-warning">
      No products match your search or selected category.
    </div>
)}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td className="fw-semibold">{product.name}</td>
                        <td>{product.category}</td>
                        <td>
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </td>
                        <td>{product.quantity}</td>
                        <td>
                          {Number(product.quantity) <=
                          Number(product.low_stock_threshold) ? (
                            <span className="badge text-bg-danger">
                              Low Stock
                            </span>
                          ) : (
                            <span className="badge text-bg-success">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              type="button"
                              disabled={deletingId !== null || saving}
                              onClick={() => openEditForm(product)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              type="button"
                              disabled={deletingId !== null || saving}
                              onClick={() => void handleDeleteProduct(product)}
                            >
                              {deletingId === product.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-secondary small mt-4">
          StockWise Inventory Management System
        </p>
      </main>
    </div>
  );
}
