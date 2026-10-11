'use client';

import { useEffect, useState } from 'react';

interface Skill {
  _id?: string;
  category: string;
  items: string[];
  order: number;
  portfolioType?: 'Full-Stack' | 'UI/UX';
}

const DEFAULT: Skill = { category: '', items: [], order: 0, portfolioType: 'Full-Stack' };

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Full-Stack' | 'UI/UX'>('Full-Stack');

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/skills');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fullstackCount = items.filter(skill => (skill.portfolioType || 'Full-Stack') === 'Full-Stack').length;
  const uiuxCount = items.filter(skill => (skill.portfolioType || 'Full-Stack') === 'UI/UX').length;

  const filteredSkills = items.filter(skill => (skill.portfolioType || 'Full-Stack') === activeTab);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const method = editing._id ? 'PUT' : 'POST';
    const url = editing._id ? `/api/skills/${editing._id}` : '/api/skills';
    const payload = {
      ...editing,
      portfolioType: activeTab,
    };
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Skills</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Manage your {activeTab} skill categories</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setEditing({ ...DEFAULT, portfolioType: activeTab })}
        >
          + Add {activeTab} Category
        </button>
      </div>

      {/* Modern Top Tab/Toggle Menu */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: 4,
          borderRadius: 14,
          background: 'var(--panel-2)',
          border: '1px solid var(--border)',
          gap: 6,
        }}>
          <button
            type="button"
            id="tab-skills-fullstack"
            onClick={() => setActiveTab('Full-Stack')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 10,
              fontSize: '.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all .2s ease',
              background: activeTab === 'Full-Stack'
                ? 'linear-gradient(100deg, var(--purple), var(--purple-deep))'
                : 'transparent',
              color: activeTab === 'Full-Stack' ? '#fff' : 'var(--muted)',
              boxShadow: activeTab === 'Full-Stack' ? '0 4px 14px rgba(157,107,255,.3)' : 'none',
            }}
          >
            <span>💻</span>
            <span>Full-Stack</span>
            <span style={{
              fontSize: '.72rem',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: 99,
              background: activeTab === 'Full-Stack' ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)',
              color: activeTab === 'Full-Stack' ? '#fff' : 'var(--muted)',
            }}>
              {fullstackCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-skills-uiux"
            onClick={() => setActiveTab('UI/UX')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 10,
              fontSize: '.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all .2s ease',
              background: activeTab === 'UI/UX'
                ? 'linear-gradient(100deg, var(--purple), var(--purple-deep))'
                : 'transparent',
              color: activeTab === 'UI/UX' ? '#fff' : 'var(--muted)',
              boxShadow: activeTab === 'UI/UX' ? '0 4px 14px rgba(157,107,255,.3)' : 'none',
            }}
          >
            <span>🎨</span>
            <span>UI/UX</span>
            <span style={{
              fontSize: '.72rem',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: 99,
              background: activeTab === 'UI/UX' ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)',
              color: activeTab === 'UI/UX' ? '#fff' : 'var(--muted)',
            }}>
              {uiuxCount}
            </span>
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Category</th>
              <th>Portfolio</th>
              <th>Skills</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading...</td></tr>
            ) : filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                  <p style={{ margin: 0, fontSize: '.95rem' }}>
                    No {activeTab} skills found.
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '.8rem', color: 'var(--muted-2)' }}>
                    Click &ldquo;+ Add {activeTab} Category&rdquo; to create your first category for this portfolio.
                  </p>
                </td>
              </tr>
            ) : (
              filteredSkills.map((item) => (
                <tr key={item._id}>
                  <td style={{ width: 80 }}>{item.order}</td>
                  <td style={{ fontWeight: 500 }}>{item.category}</td>
                  <td>
                    <span className="badge" style={{
                      background: (item.portfolioType || 'Full-Stack') === 'UI/UX' ? '#8b5cf620' : '#3b82f620',
                      color: (item.portfolioType || 'Full-Stack') === 'UI/UX' ? '#a78bfa' : '#60a5fa'
                    }}>
                      {item.portfolioType || 'Full-Stack'}
                    </span>
                  </td>
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
            <h2>{editing._id ? `Edit ${editing.portfolioType || activeTab} Category` : `Add ${activeTab} Category`}</h2>
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
