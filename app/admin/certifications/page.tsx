'use client';

import { useEffect, useState } from 'react';

interface Certification { _id?: string; title: string; issuer: string; year: string; order: number; }

const DEFAULT: Certification = { title: '', issuer: '', year: '', order: 0 };

export default function AdminCertifications() {
  const [items, setItems] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/certifications');
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
    const url = editing._id ? `/api/certifications/${editing._id}` : '/api/certifications';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      fetchItems();
    } else {
      alert('Failed to save certification');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
    if (res.ok) fetchItems();
    else alert('Failed to delete certification');
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Certifications</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Manage your achievements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...DEFAULT })}>+ Add Certification</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Certification</th>
              <th>Issuer / Year</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No certifications found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td style={{ width: 80 }}>{item.order}</td>
                  <td style={{ fontWeight: 500 }}>{item.title}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{item.issuer} · {item.year}</td>
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
            <h2>{editing._id ? 'Edit Certification' : 'Add Certification'}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <label>Title</label>
              <input required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              
              <label>Issuer (Organization)</label>
              <input required value={editing.issuer} onChange={e => setEditing({ ...editing, issuer: e.target.value })} />
              
              <label>Year</label>
              <input required value={editing.year} onChange={e => setEditing({ ...editing, year: e.target.value })} placeholder="e.g. 2026" />
              
              <label>Order (Display priority)</label>
              <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} />

              <div className="admin-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
