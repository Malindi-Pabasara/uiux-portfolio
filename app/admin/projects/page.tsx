'use client';

import { useEffect, useRef, useState } from 'react';

interface Project {
  _id?: string;
  title: string;
  description: string;
  tags: string[];
  caseStudyUrl: string;
  prototypeUrl: string;
  order: number;
  imageUrl: string;
  category?: 'fullstack' | 'uiux';
}

const DEFAULT: Project = { title: '', description: '', tags: [], caseStudyUrl: '', prototypeUrl: '', order: 0, imageUrl: '', category: 'uiux' };

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'Upload failed');
  }
  return (await res.json()).url as string;
}

export default function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgUploading, setImgUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const imgRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/projects');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setImgUploading(true);
    setUploadMsg('');
    try {
      const url = await uploadFile(file, 'portfolio/projects');
      if (editing.imageUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: editing.imageUrl }),
        }).catch(() => {});
      }
      setEditing({ ...editing, imageUrl: url });
      setUploadMsg('✓ Image uploaded!');
    } catch (err: any) {
      setUploadMsg(`✗ ${err.message}`);
    } finally {
      setImgUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const method = editing._id ? 'PUT' : 'POST';
    const url = editing._id ? `/api/projects/${editing._id}` : '/api/projects';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    if (res.ok) { setEditing(null); fetchItems(); }
    else alert('Failed to save project');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) fetchItems();
    else alert('Failed to delete project');
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Manage your featured work</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing({ ...DEFAULT }); setUploadMsg(''); }}>+ Add Project</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Tags</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No projects found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td style={{ width: 60 }}>{item.order}</td>
                  <td style={{ width: 56 }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.title} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                      : <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--panel)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: 'var(--muted)' }}>none</div>
                    }
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.title}</td>
                  <td>
                    <span className="badge" style={{ background: item.category === 'uiux' ? '#8b5cf620' : '#3b82f620', color: item.category === 'uiux' ? '#a78bfa' : '#60a5fa' }}>
                      {item.category === 'uiux' ? 'UI/UX' : 'Full-Stack'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.tags.map(t => <span key={t} className="badge">{t}</span>)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '.8rem' }} onClick={() => { setEditing(item); setUploadMsg(''); }}>Edit</button>
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
            <h2>{editing._id ? 'Edit Project' : 'Add Project'}</h2>
            <form onSubmit={handleSave} className="admin-form">

              {/* Project Image Upload */}
              <label>Project Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
                {editing.imageUrl
                  ? <img src={editing.imageUrl} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  : <div style={{ width: 60, height: 60, borderRadius: 8, background: 'var(--panel)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', color: 'var(--muted)' }}>No img</div>
                }
                <div>
                  <input ref={imgRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '6px 12px', fontSize: '.82rem' }}
                    disabled={imgUploading}
                    onClick={() => imgRef.current?.click()}
                  >
                    {imgUploading ? 'Uploading…' : '📷 Upload Image'}
                  </button>
                  {uploadMsg && (
                    <p style={{ fontSize: '.78rem', marginTop: 4, color: uploadMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{uploadMsg}</p>
                  )}
                </div>
              </div>

              <label>Title</label>
              <input required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />

              <label>Category</label>
              <select
                value={editing.category || 'fullstack'}
                onChange={e => setEditing({ ...editing, category: e.target.value as 'fullstack' | 'uiux' })}
                style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'inherit' }}
              >
                <option value="fullstack">Full-Stack</option>
                <option value="uiux">UI/UX</option>
              </select>

              <label>Description</label>
              <textarea required value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />

              <label>Tags (comma-separated)</label>
              <input
                value={editing.tags.join(', ')}
                onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="HTML, CSS, React"
              />

              <label>Case Study URL</label>
              <input
                value={editing.caseStudyUrl}
                onChange={e => setEditing({ ...editing, caseStudyUrl: e.target.value })}
                placeholder="https://behance.net/your-case-study"
              />

              <label>Prototype URL</label>
              <input
                value={editing.prototypeUrl}
                onChange={e => setEditing({ ...editing, prototypeUrl: e.target.value })}
                placeholder="https://figma.com/proto/..."
              />

              <label>Order (Display priority)</label>
              <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} />

              <div className="admin-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={imgUploading}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
