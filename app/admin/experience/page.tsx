'use client';

import { useEffect, useState } from 'react';

interface Experience { _id?: string; title: string; company: string; period: string; bullets: string[]; order: number; }

const DEFAULT: Experience = { title: '', company: '', period: '', bullets: [], order: 0 };

export default function AdminExperience() {
  const [items, setItems] = useState<Experience[]>([]);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/experience');
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
    const url = editing._id ? `/api/experience/${editing._id}` : '/api/experience';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      fetchItems();
    } else {
      alert('Failed to save experience');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
    if (res.ok) fetchItems();
    else alert('Failed to delete experience');
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Experience</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Manage your work history</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...DEFAULT })}>+ Add Experience</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Role & Company</th>
              <th>Bullets</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No experience found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td style={{ width: 80 }}>{item.order}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{item.company} {item.period && `(${item.period})`}</div>
                  </td>
                  <td>{item.bullets.length} points</td>
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
            <h2>{editing._id ? 'Edit Experience' : 'Add Experience'}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <label>Job Title</label>
              <input required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              
              <label>Company</label>
              <input required value={editing.company} onChange={e => setEditing({ ...editing, company: e.target.value })} />
              
              <label>Period (optional)</label>
              <input value={editing.period} onChange={e => setEditing({ ...editing, period: e.target.value })} placeholder="e.g. 2021 - Present" />
              
              <label>Bullet Points (one per line)</label>
              <textarea value={editing.bullets.join('\n')} onChange={e => setEditing({ ...editing, bullets: e.target.value.split('\n').map(t => t.trim()).filter(Boolean) })} style={{ height: 120 }} />
              
              <label>Order (Display priority)</label>
              <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} />

              <div className="admin-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
