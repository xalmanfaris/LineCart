import React, { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  archiveProduct,
  softDeleteProduct,
} from '../../api';
import { resolveAssetImage } from '../../utils/assetResolver';

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
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let images = initial && initial.images ? [...initial.images] : [];
      if (imageFile) {
        const dataUrl = await fileToDataUrl(imageFile);
        images = [dataUrl, ...images];
      }

      const payload = {
        name,
        description: desc,
        price: Number(price) || 0,
        count: Number(count) || 0,
        category,
        images,
        isActive: initial ? (initial.isActive ?? true) : true,
        created_at: initial ? initial.created_at : new Date().toISOString(),
      };

      if (initial && initial.id) {
        const updated = await updateProduct(initial.id, payload);
        onSaved(updated);
      } else {
        const created = await createProduct(payload);
        onSaved(created);
      }
    } catch (err) {
      console.error(err);
      alert('Unable to save product. See console.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
      <input className="auth-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <textarea className="auth-input" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="auth-input" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        <input className="auth-input" placeholder="Count (gm)" value={count} onChange={e => setCount(e.target.value)} />
      </div>
      <input className="auth-input" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files && e.target.files[0])} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res);
    } catch (err) {
      console.error('Failed fetching products', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    const ok = window.confirm('Permanently delete this product? This cannot be undone.');
    if (!ok) return;
    try {
      setBusyId(id);
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
    } catch (err) {
      console.error(err);
      alert('Unable to delete product.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(id) {
    const ok = window.confirm('Archive this product? It will be hidden from active listings.');
    if (!ok) return;
    try {
      setBusyId(id);
      const updated = await archiveProduct(id);
      setProducts(prev => prev.map(p => (String(p.id) === String(id) ? updated : p)));
    } catch (err) {
      console.error(err);
      alert('Unable to archive product.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleSoftDelete(id) {
    const ok = window.confirm('Soft delete this product (mark as deleted)?');
    if (!ok) return;
    try {
      setBusyId(id);
      const updated = await softDeleteProduct(id);
      setProducts(prev => prev.map(p => (String(p.id) === String(id) ? updated : p)));
    } catch (err) {
      console.error(err);
      alert('Unable to soft-delete product.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ background: 'white', padding: 12, borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>📦 Manage Products</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => { setCreating(true); setEditing(null); }}> Add product</button>
          <button className="btn btn-ghost" onClick={load}> Refresh</button>
        </div>
      </div>

      {creating && (
        <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', marginBottom: 12 }}>
          <h4 style={{ marginTop: 0 }}>Create product</h4>
          <ProductForm initial={null} onCancel={() => setCreating(false)} onSaved={(p) => { setProducts(prev => [p, ...prev]); setCreating(false); }} />
        </div>
      )}

      {editing && (
        <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', marginBottom: 12 }}>
          <h4 style={{ marginTop: 0 }}>Edit product</h4>
          <ProductForm initial={editing} onCancel={() => setEditing(null)} onSaved={(p) => { setProducts(prev => prev.map(x => (String(x.id) === String(p.id) ? p : x))); setEditing(null); }} />
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {products.map(p => {
            const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
            return (
              <div key={p.id} style={{ padding: 12, borderRadius: 8, background: 'white', boxShadow: 'var(--shadow)', display: 'flex', gap: 12 }}>
                <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9' }}>
                  <img
                    src={imgSrc}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = resolveAssetImage(null, p.category, p.name);
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 6px 0' }}>{p.name} {p.isActive === false && <small style={{ color: '#7b1f1f' }}>(archived)</small>}</h4>
                  <div style={{ color: '#6b7280', marginBottom: 8 }}>{p.description}</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>₹{p.price}</div>
                    <div style={{ color: '#6b7280' }}>{p.count} gm</div>
                    <div style={{ color: '#6b7280' }}>{p.category}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setEditing(p)}>Edit</button>
                  <button className="btn btn-ghost" onClick={() => handleArchive(p.id)} disabled={busyId === p.id}>{busyId === p.id ? 'Working…' : 'Archive'}</button>
                  <button className="btn btn-ghost" onClick={() => handleSoftDelete(p.id)} disabled={busyId === p.id}>Soft delete</button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(p.id)} disabled={busyId === p.id} style={{ color: '#9a1f1f' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}