'use client';

import { useEffect, useState } from 'react';

interface Education { _id?: string; degree: string; institution: string; period: string; details: string; active: boolean; order: number; }

const DEFAULT: Education = { degree: '', institution: '', period: '', details: '', active: true, order: 0 };

export default function AdminEducation() {
  const [items, setItems] = useState<Education[]>([]);
  const [editing, setEditing] = useState<Education | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/education');
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
    const url = editing._id ? `/api/education/${editing._id}` : '/api/education';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      fetchItems();
    } else {
      alert('Failed to save education');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    const res = await fetch(`/api/education/${id}`, { method: 'DELETE' });
    if (res.ok) fetchItems();
    else alert('Failed to delete education entry');
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Education</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Manage your educational background</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...DEFAULT })}>+ Add Education</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Degree & Institution</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No education history found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td style={{ width: 80 }}>{item.order}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.degree}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{item.institution} ({item.period})</div>
                  </td>
                  <td>
                    {item.active ? (
                      <span className="badge" style={{ borderColor: 'var(--purple)', color: 'var(--purple)', background: 'rgba(157,107,255,.1)' }}>Active</span>
                    ) : (
                      <span className="badge">Completed</span>
                    )}
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
            <h2>{editing._id ? 'Edit Education' : 'Add Education'}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <label>Degree / Program</label>
              <input required value={editing.degree} onChange={e => setEditing({ ...editing, degree: e.target.value })} />
              
              <label>Institution</label>
              <input required value={editing.institution} onChange={e => setEditing({ ...editing, institution: e.target.value })} />
              
              <label>Period</label>
              <input required value={editing.period} onChange={e => setEditing({ ...editing, period: e.target.value })} placeholder="e.g. 2024–2026" />
              
              <label>Details (optional)</label>
              <textarea value={editing.details} onChange={e => setEditing({ ...editing, details: e.target.value })} style={{ height: 80 }} placeholder="Core focus: OOP, DBMS..." />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} style={{ width: 'auto', margin: 0 }} />
                Currently Active (highlights timeline dot)
              </label>

              <label>Order (Display priority)</label>
              <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} />

              <div className="admin-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Education</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
