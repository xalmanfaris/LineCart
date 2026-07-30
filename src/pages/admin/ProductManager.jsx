import React, { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api';
import { useNotification } from '../../contexts/NotificationContext';


function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProductForm({ initial = null, onCancel, onSaved }) {
  const [name, setName] = useState(initial ? initial.name : '');
  const [desc, setDesc] = useState(initial ? initial.description : '');
  const [price, setPrice] = useState(initial ? initial.price : '');
  const [count, setCount] = useState(initial ? initial.count : '');
  const [category, setCategory] = useState(initial ? initial.category : '');
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: desc.trim(),
        price: Number(price) || 0,
        count: Number(count) || 0,
        category: category.trim(),
        imageFiles: imageFiles,
        images: initial && initial.images ? initial.images : [],
        isActive: true,
        deleted: false
      };

      if (initial && initial.id) {
        const updated = await updateProduct(initial.id, payload);
        onSaved(updated.product || updated);
        showNotification('Product updated successfully!');
      } else {
        const created = await createProduct(payload);
        onSaved(created);
        showNotification('Product created successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to save product. See console.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <label className="auth-field">
        <span className="field-label">Product name</span>
        <input
          className="auth-input"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="e.g. Premium Dates"
        />
      </label>

      <label className="auth-field">
        <span className="field-label">Description</span>
        <textarea
          className="auth-input"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          placeholder="Product description..."
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label className="auth-field">
          <span className="field-label">Price (₹)</span>
          <input
            className="auth-input"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
        </label>

        <label className="auth-field">
          <span className="field-label">Count (grams)</span>
          <input
            className="auth-input"
            type="number"
            min="0"
            value={count}
            onChange={e => setCount(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="auth-field">
        <span className="field-label">Category</span>
        <input
          className="auth-input"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
          placeholder="e.g. Dates, Badam, Cashew"
        />
      </label>

      <label className="auth-field">
        <span className="field-label">Product images</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          style={{ marginTop: 4 }}
        />
      </label>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : (initial ? 'Update product' : 'Create product')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function DeleteConfirmModal({ product, onConfirm, onCancel, busy }) {
  if (!product) return null;

  return (
    <div className="product-modal-overlay" style={{ zIndex: 1000 }}>
      <div className="admin-card" style={{ maxWidth: '400px', width: '90%', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 className="admin-card-title" style={{ marginBottom: '12px' }}>Delete Product?</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="admin-button"
            onClick={onCancel}
            disabled={busy || busy === undefined}
          >
            Cancel
          </button>
          <button
            className="admin-button admin-button-danger"
            onClick={() => onConfirm(product.id)}
            disabled={busy}
          >
            {busy ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { showNotification } = useNotification();

  async function load() {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    try {
      setBusyId(id);
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
      showNotification('Product deleted successfully!');
      setDeleting(null);
    } catch (err) {
      console.error(err);
      alert('Unable to delete product.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-fade-in">
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Manage Products</h3>
          <div className="flex gap-3">
            <button className="admin-button admin-button-primary" onClick={() => { setCreating(true); setEditing(null); }}>
              Add Product
            </button>
            <button className="admin-button" onClick={load}>Refresh</button>
          </div>
        </div>

        {creating && (
          <div className="admin-card mb-6">
            <div className="admin-card-header">
              <h4 className="admin-card-title">Create Product</h4>
            </div>
            <ProductForm
              initial={null}
              onCancel={() => setCreating(false)}
              onSaved={(p) => {
                setProducts(prev => [p, ...prev]);
                setCreating(false);
              }}
            />
          </div>
        )}

        {editing && (
          <div className="admin-card mb-6">
            <div className="admin-card-header">
              <h4 className="admin-card-title">Edit Product</h4>
            </div>
            <ProductForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSaved={(p) => {
                setProducts(prev => prev.map(x => (String(x.id) === String(p.id) ? p : x)));
                setEditing(null);
              }}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">📦</div>
                <div className="text-lg">No products found</div>
                <div className="text-sm text-gray-400 mt-2">Add your first product to get started</div>
              </div>
            ) : (
              products.map(p => (
                <div key={p.id} className="admin-card" style={{ padding: '16px' }}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="product-image-container" style={{ width: '64px', height: '64px' }}>
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="product-image" />
                        ) : (
                          <div className="product-image-placeholder">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{p.name}</h4>
                          <p className="text-gray-600 mt-1">{p.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>₹{p.price}</span>
                            <span>{p.count} gm</span>
                            <span>{p.category}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="admin-button" onClick={() => setEditing(p)}>
                            Edit
                          </button>
                          <button
                            className="admin-button admin-button-danger"
                            onClick={() => setDeleting(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        product={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        busy={busyId === deleting?.id}
      />
    </div>
  );
}

export default ProductManager;