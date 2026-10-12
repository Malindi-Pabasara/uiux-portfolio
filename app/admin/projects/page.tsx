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

const DEFAULT: Project = { title: '', description: '', tags: [], caseStudyUrl: '', prototypeUrl: '', order: 0, imageUrl: '', category: 'fullstack' };

async function uploadFile(file: File, folder: string, resourceType?: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  if (resourceType) {
    fd.append('resource_type', resourceType);
  }
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Upload failed (HTTP ${res.status})`;
    try {
      const data = JSON.parse(text);
      msg = data.message ?? data.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
  const data = JSON.parse(text);
  if (!data.url) throw new Error('Cloudinary returned no URL');
  return data.url as string;
}

function sanitizeCaseStudyUrl(url?: string): string {
  if (!url || url === '#') return '';
  return url
    .replace(/\/fl_attachment:[^/]+/g, '')
    .replace(/\/fl_attachment\/?/g, '/')
    .replace(/,fl_attachment/g, '')
    .replace(/fl_attachment,?/g, '')
    .replace(/fl_attachment/g, '');
}

/**
 * Direct client-side unsigned upload to Cloudinary.
 * Bypasses Vercel's 4.5MB serverless request body limit and supports up to 100MB.
 * Appends resource_type: 'image' to ensure Cloudinary serves PDF inline instead of forcing download.
 */
async function uploadCaseStudyDirect(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'qkv9xaot';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio_unsigned';

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured.');
  }

  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', uploadPreset);
  // CRITICAL: resource_type MUST be 'image' so Cloudinary treats PDF as inline-viewable document
  fd.append('resource_type', 'image');
  fd.append('folder', 'portfolio/case-studies');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Upload failed (HTTP ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error?.message || `Upload failed (HTTP ${res.status})`);
  }

  const rawUrl = (data.secure_url || data.url) as string;
  if (!rawUrl) {
    throw new Error('Cloudinary returned no URL');
  }

  return sanitizeCaseStudyUrl(rawUrl);
}

function fileName(url: string) {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? url);
    return name.length > 32 ? name.slice(0, 29) + '...' : name;
  } catch {
    return url.length > 32 ? url.slice(0, 29) + '...' : url;
  }
}

export default function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgUploading, setImgUploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [caseStudyMsg, setCaseStudyMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'fullstack' | 'uiux'>('fullstack');
  const imgRef = useRef<HTMLInputElement>(null);
  const caseStudyRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/projects');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  // Strict category helpers to ensure zero crossover
  const isFullstack = (c?: string) => c === 'fullstack' || c === 'Full-Stack';
  const isUiUx = (c?: string) => c === 'uiux' || c === 'UI/UX';

  const fullstackCount = items.filter(i => isFullstack(i.category)).length;
  const uiuxCount = items.filter(i => isUiUx(i.category)).length;

  const filteredItems = items.filter(item => {
    if (activeTab === 'fullstack') {
      return isFullstack(item.category);
    }
    return isUiUx(item.category);
  });

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

  const handleCaseStudyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setCaseStudyMsg('✗ Only PDF files are allowed for case studies');
      return;
    }

    // Manual validation check: 100MB (104857600 bytes)
    const maxSize = 104857600; // 100MB (updated from 10485760 / 10MB)
    const MAX_CASE_STUDY_BYTES = maxSize;
    if (file.size > MAX_CASE_STUDY_BYTES) {
      setCaseStudyMsg('✗ File size too large. Maximum is 100MB');
      return;
    }

    setIsUploading(true);
    setCaseStudyMsg('');
    try {
      // Delete old file if existing Cloudinary asset
      if (editing.caseStudyUrl && editing.caseStudyUrl.includes('cloudinary')) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: editing.caseStudyUrl }),
        }).catch(() => {});
      }
      // Direct client-side unsigned upload to Cloudinary (bypassing Vercel 4.5MB limit)
      const url = await uploadCaseStudyDirect(file);
      setEditing({ ...editing, caseStudyUrl: url });
      setCaseStudyMsg('✓ Case study PDF uploaded!');
    } catch (err: any) {
      setCaseStudyMsg(`✗ ${err.message || 'Upload failed'}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCaseStudyRemove = () => {
    if (!editing) return;
    if (editing.caseStudyUrl && editing.caseStudyUrl.includes('cloudinary')) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editing.caseStudyUrl }),
      }).catch(() => {});
    }
    setEditing({ ...editing, caseStudyUrl: '' });
    setCaseStudyMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const method = editing._id ? 'PUT' : 'POST';
    const url = editing._id ? `/api/projects/${editing._id}` : '/api/projects';
    const payload = {
      ...editing,
      category: editing.category || activeTab,
    };
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

  const hasCaseStudy = !!editing?.caseStudyUrl && editing.caseStudyUrl !== '#';

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Manage your featured work</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing({ ...DEFAULT, category: activeTab });
            setUploadMsg('');
            setCaseStudyMsg('');
          }}
        >
          + Add {activeTab === 'uiux' ? 'UI/UX' : 'Full-Stack'} Project
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
            id="tab-projects-fullstack"
            onClick={() => setActiveTab('fullstack')}
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
              background: activeTab === 'fullstack'
                ? 'linear-gradient(100deg, var(--purple), var(--purple-deep))'
                : 'transparent',
              color: activeTab === 'fullstack' ? '#fff' : 'var(--muted)',
              boxShadow: activeTab === 'fullstack' ? '0 4px 14px rgba(157,107,255,.3)' : 'none',
            }}
          >
            <span>💻</span>
            <span>Full-Stack</span>
            <span style={{
              fontSize: '.72rem',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: 99,
              background: activeTab === 'fullstack' ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)',
              color: activeTab === 'fullstack' ? '#fff' : 'var(--muted)',
            }}>
              {fullstackCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-projects-uiux"
            onClick={() => setActiveTab('uiux')}
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
              background: activeTab === 'uiux'
                ? 'linear-gradient(100deg, var(--purple), var(--purple-deep))'
                : 'transparent',
              color: activeTab === 'uiux' ? '#fff' : 'var(--muted)',
              boxShadow: activeTab === 'uiux' ? '0 4px 14px rgba(157,107,255,.3)' : 'none',
            }}
          >
            <span>🎨</span>
            <span>UI/UX</span>
            <span style={{
              fontSize: '.72rem',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: 99,
              background: activeTab === 'uiux' ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)',
              color: activeTab === 'uiux' ? '#fff' : 'var(--muted)',
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
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                  <p style={{ margin: 0, fontSize: '.95rem' }}>
                    No {activeTab === 'uiux' ? 'UI/UX' : 'Full-Stack'} projects found.
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '.8rem', color: 'var(--muted-2)' }}>
                    Click &ldquo;+ Add {activeTab === 'uiux' ? 'UI/UX' : 'Full-Stack'} Project&rdquo; to create your first project in this category.
                  </p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
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
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '.8rem' }} onClick={() => { setEditing(item); setUploadMsg(''); setCaseStudyMsg(''); }}>Edit</button>
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
            <h2>{editing._id ? `Edit ${editing.category === 'uiux' ? 'UI/UX' : 'Full-Stack'} Project` : `Add ${activeTab === 'uiux' ? 'UI/UX' : 'Full-Stack'} Project`}</h2>
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

              {/* Category selection locked to activeTab/editing category to prevent accidental crossover */}
              <label>Category</label>
              <select
                disabled
                value={editing.category || activeTab}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  marginBottom: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel-2)',
                  color: 'var(--muted)',
                  cursor: 'not-allowed',
                  opacity: 0.85,
                }}
              >
                <option value="fullstack">Full-Stack</option>
                <option value="uiux">UI/UX</option>
              </select>
              <p style={{ margin: '0 0 16px', fontSize: '.75rem', color: 'var(--muted)' }}>
                Category is automatically locked to {activeTab === 'uiux' ? 'UI/UX' : 'Full-Stack'} based on the active tab.
              </p>

              <label>Description</label>
              <textarea required value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />

              <label>Tags (comma-separated)</label>
              <input
                value={editing.tags.join(', ')}
                onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="HTML, CSS, React"
              />

              {/* Case Study (PDF Upload) */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ margin: 0 }}>Case Study (PDF)</label>
                  {hasCaseStudy && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '.72rem',
                      fontWeight: 700,
                      letterSpacing: '.04em',
                      textTransform: 'uppercase',
                      background: 'rgba(74,222,128,.12)',
                      color: '#4ade80',
                      border: '1px solid rgba(74,222,128,.3)',
                      borderRadius: 6,
                      padding: '2px 8px',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                      PDF Attached
                    </span>
                  )}
                </div>

                <input
                  ref={caseStudyRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleCaseStudyUpload}
                  style={{ display: 'none' }}
                  data-max-size={104857600}
                />

                {hasCaseStudy ? (
                  <div style={{
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--panel-2)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* PDF icon badge */}
                      <div style={{
                        width: 38, height: 44, borderRadius: 6, flexShrink: 0,
                        background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.62rem', fontWeight: 800, color: '#f87171', letterSpacing: '.05em',
                      }}>PDF</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '.84rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fileName(editing.caseStudyUrl)}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '.74rem', color: 'var(--muted)' }}>
                          Stored on Cloudinary
                        </p>
                      </div>
                      <a
                        href={sanitizeCaseStudyUrl(editing.caseStudyUrl) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '.82rem',
                          fontWeight: 600,
                          color: 'var(--purple)',
                          textDecoration: 'none',
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: 'rgba(157,107,255,.08)',
                          border: '1px solid rgba(157,107,255,.3)',
                          whiteSpace: 'nowrap',
                          transition: 'all .15s',
                        }}
                      >
                        View File ↗
                      </a>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(36,43,82,.6)' }}>
                      <button
                        type="button"
                        onClick={() => caseStudyRef.current?.click()}
                        disabled={isUploading}
                        className="btn btn-ghost"
                        style={{ padding: '6px 12px', fontSize: '.8rem' }}
                      >
                        {isUploading ? 'Uploading…' : '🔄 Replace PDF'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCaseStudyRemove}
                        disabled={isUploading}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '6px 12px', borderRadius: 8, fontSize: '.8rem', fontWeight: 500,
                          cursor: 'pointer', background: 'rgba(248,113,113,.08)',
                          border: '1px solid rgba(248,113,113,.3)', color: '#f87171',
                        }}
                      >
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => caseStudyRef.current?.click()}
                      disabled={isUploading}
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: '.86rem',
                        borderStyle: 'dashed',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {isUploading ? (
                        <>
                          <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".25"/><path d="M21 12a9 9 0 0 1-9 9"/>
                          </svg>
                          Uploading…
                        </>
                      ) : (
                        <>📄 Upload Case Study (PDF)</>
                      )}
                    </button>
                    <p style={{ margin: '6px 0 0', fontSize: '.74rem', color: 'var(--muted)' }}>
                      Accepted: PDF — max 100 MB. Direct client upload opens inline in a new browser tab.
                    </p>
                  </div>
                )}
                {caseStudyMsg && (
                  <p style={{ fontSize: '.78rem', marginTop: 6, color: caseStudyMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>
                    {caseStudyMsg}
                  </p>
                )}
              </div>

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
                <button type="submit" className="btn btn-primary" disabled={imgUploading || isUploading}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
