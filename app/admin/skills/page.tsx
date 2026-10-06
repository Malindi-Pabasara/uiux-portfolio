'use client';

import { useEffect, useState } from 'react';

interface Skill { _id?: string; category: string; items: string[]; order: number; }

const DEFAULT: Skill = { category: '', items: [], order: 0 };

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/skills');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const method = editing._id ? 'PUT' : 'POST';
    const url = editing._id ? `/api/skills/${editing._id}` : '/api/skills';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      fetchItems();
    } else {
      alert('Failed to save skill category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    if (res.ok) fetchItems();
    else alert('Failed to delete skill category');
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Skills</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Manage skill categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...DEFAULT })}>+ Add Category</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Category</th>
              <th>Skills</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No skills found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td style={{ width: 80 }}>{item.order}</td>
                  <td style={{ fontWeight: 500 }}>{item.category}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.items.map(t => <span key={t} className="badge">{t}</span>)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '.8rem' }} onClick={() => setEditing(item)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '.8rem' }} onClick={() => handleDelete(item._id!)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editing._id ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <label>Category Name</label>
              <input required value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="Frontend & UI/UX" />
              
              <label>Skills (comma-separated)</label>
              <input value={editing.items.join(', ')} onChange={e => setEditing({ ...editing, items: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="HTML, CSS, React" />
              
              <label>Order (Display priority)</label>
              <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} />

              <div className="admin-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
