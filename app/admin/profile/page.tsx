'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat { label: string; value: number; suffix: string; }
interface ProfileData {
  name: string; title: string; tagline: string; bio: string;
  available: boolean; stats: Stat[];
  email: string; phone: string; linkedin: string; github: string;
  cvUrl: string; avatarUrl: string;
}

const DEFAULT: ProfileData = {
  name: '', title: '', tagline: '', bio: '', available: true,
  stats: [
    { label: 'systems built', value: 3, suffix: '' },
    { label: 'certifications', value: 3, suffix: '' },
    { label: 'tools & languages', value: 10, suffix: '+' },
  ],
  email: '', phone: '', linkedin: '', github: '', cvUrl: '', avatarUrl: '',
};

/* ─── helpers ─────────────────────────────────────────────── */
async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Upload failed');
  return data.url as string;
}

function fileName(url: string) {
  try { return decodeURIComponent(new URL(url).pathname.split('/').pop() ?? url); }
  catch { return url; }
}

/* ─── sub-components ──────────────────────────────────────── */
interface FileUploadBlockProps {
  label: string;
  hint: string;
  accept: string;
  uploading: boolean;
  currentUrl: string;
  previewType: 'image' | 'document';
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}

function FileUploadBlock({
  label, hint, accept, uploading, currentUrl, previewType, onUpload, onDelete,
}: FileUploadBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFile = !!currentUrl;

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '20px 22px',
      background: 'var(--panel)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: '.92rem' }}>{label}</span>
        <span style={{
          fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
          background: hasFile ? 'rgba(74,222,128,.12)' : 'rgba(156,163,175,.12)',
          color: hasFile ? '#4ade80' : 'var(--muted)',
          border: `1px solid ${hasFile ? 'rgba(74,222,128,.3)' : 'var(--border)'}`,
          borderRadius: 6, padding: '2px 8px',
        }}>
          {hasFile ? 'Uploaded' : 'Not set'}
        </span>
      </div>

      {/* Preview */}
      {hasFile && (
        <div style={{
          borderRadius: 10, overflow: 'hidden', marginBottom: 14,
          border: '1px solid var(--border)', background: 'var(--panel-2)',
        }}>
          {previewType === 'image' ? (
            <img
              src={currentUrl}
              alt="Preview"
              style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover' }}
            />
          ) : (
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* PDF icon */}
              <div style={{
                width: 40, height: 48, borderRadius: 6, flexShrink: 0,
                background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.65rem', fontWeight: 800, color: '#f87171', letterSpacing: '.05em',
              }}>PDF</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileName(currentUrl)}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '.74rem', color: 'var(--muted)' }}>Stored on Cloudinary</p>
              </div>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '.8rem', color: 'var(--purple)', whiteSpace: 'nowrap', textDecoration: 'none' }}
              >
                Open ↗
              </a>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Hidden native input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onUpload}
          style={{ display: 'none' }}
        />

        {/* Upload / Replace button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, fontSize: '.84rem', fontWeight: 500,
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: 'var(--panel-2)', border: '1px solid var(--border)',
            color: 'var(--fg)', transition: 'border-color .15s',
          }}
          onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--purple)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          {uploading ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".25"/><path d="M21 12a9 9 0 0 1-9 9"/>
              </svg>
              Uploading…
            </>
          ) : hasFile ? (
            <>{previewType === 'image' ? '🔄' : '📄'} Replace</>
          ) : (
            <>{previewType === 'image' ? '📷' : '📄'} {previewType === 'image' ? 'Upload Image' : 'Upload PDF'}</>
          )}
        </button>

        {/* Delete button — only shown when a file exists */}
        {hasFile && (
          <button
            type="button"
            onClick={onDelete}
            disabled={uploading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, fontSize: '.84rem', fontWeight: 500,
              cursor: 'pointer', background: 'rgba(248,113,113,.08)',
              border: '1px solid rgba(248,113,113,.3)', color: '#f87171', transition: 'border-color .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,.3)'; }}
          >
            🗑 Delete
          </button>
        )}
      </div>

      {/* Hint */}
      <p style={{ margin: '10px 0 0', fontSize: '.74rem', color: 'var(--muted)' }}>{hint}</p>

      {/* Spinner keyframes (injected once) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── main page ───────────────────────────────────────────── */
export default function AdminProfile() {
  const [form, setForm] = useState<ProfileData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  useEffect(() => {
    fetch('/api/profile').then(r => {
      if (!r.ok) {
        console.error('API Error');
        return null;
      }
      return r.json();
    }).then((d) => {
      if (!d || Object.keys(d).length === 0) return;
      // Only copy known schema fields — never let _id / __v into form state
      setForm({
        name:      d.name       ?? '',
        title:     d.title      ?? '',
        tagline:   d.tagline    ?? '',
        bio:       d.bio        ?? '',
        available: d.available  ?? true,
        stats:     Array.isArray(d.stats) ? d.stats : DEFAULT.stats,
        email:     d.email      ?? '',
        phone:     d.phone      ?? '',
        linkedin:  d.linkedin   ?? '',
        github:    d.github     ?? '',
        cvUrl:     d.cvUrl      ?? '',
        avatarUrl: d.avatarUrl  ?? '',
      });
    });
  }, []);

  const set = (key: keyof ProfileData, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }));

  const setStat = (i: number, field: keyof Stat, val: string | number) => {
    const stats = [...form.stats];
    stats[i] = { ...stats[i], [field]: field === 'value' ? Number(val) : val };
    setForm(f => ({ ...f, stats }));
  };

  /* ── avatar handlers ── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, 'portfolio/avatars');
      if (form.avatarUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: form.avatarUrl }),
        }).catch(() => {});
      }
      const payload = { ...form, avatarUrl: url };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile database');
      set('avatarUrl', url);
      setMsg({ text: '✓ Profile picture uploaded and saved!', ok: true });
    } catch (err: any) {
      setMsg({ text: `✗ Avatar upload failed: ${err.message}`, ok: false });
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    if (!confirm('Are you sure you want to delete your profile picture? This cannot be undone.')) return;
    setAvatarUploading(true);
    try {
      if (form.avatarUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: form.avatarUrl }),
        });
      }
      const payload = { ...form, avatarUrl: '' };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      set('avatarUrl', '');
      setMsg({ text: '✓ Profile picture deleted completely.', ok: true });
    } catch (err: any) {
      setMsg({ text: `✗ Failed to delete picture: ${err.message}`, ok: false });
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── CV handlers ── */
  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvUploading(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, 'portfolio/cv');
      if (form.cvUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: form.cvUrl }),
        }).catch(() => {});
      }
      const payload = { ...form, cvUrl: url };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile database');
      set('cvUrl', url);
      setMsg({ text: '✓ CV uploaded and saved!', ok: true });
    } catch (err: any) {
      setMsg({ text: `✗ CV upload failed: ${err.message}`, ok: false });
    } finally {
      setCvUploading(false);
      e.target.value = '';
    }
  };

  const handleCvDelete = async () => {
    if (!confirm('Are you sure you want to completely delete your CV? This cannot be undone.')) return;
    setCvUploading(true);
    setMsg(null);
    try {
      if (form.cvUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: form.cvUrl }),
        });
      }
      
      const payload = { ...form, cvUrl: '' };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      
      set('cvUrl', '');
      setMsg({ text: '✓ CV deleted completely.', ok: true });
    } catch (err: any) {
      setMsg({ text: `✗ Failed to delete CV: ${err.message}`, ok: false });
    } finally {
      setCvUploading(false);
    }
  };

  /* ── form submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Build a clean payload containing only the known schema fields.
    // This prevents _id / __v / timestamps (which are set by setForm(d) on load)
    // from reaching the API and causing "Mod on _id not allowed" errors.
    const payload: ProfileData = {
      name:       form.name,
      title:      form.title,
      tagline:    form.tagline,
      bio:        form.bio,
      available:  form.available,
      stats:      form.stats.map(s => ({ label: s.label, value: Number(s.value), suffix: s.suffix ?? '' })),
      email:      form.email,
      phone:      form.phone,
      linkedin:   form.linkedin,
      github:     form.github,
      cvUrl:      form.cvUrl,
      avatarUrl:  form.avatarUrl,
    };

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.ok) {
      setMsg({ text: '✓ Profile saved successfully!', ok: true });
    } else {
      const errData = await res.json().catch(() => ({}));
      const detail = errData.error ?? errData.detail ?? 'Unknown error';
      setMsg({ text: `✗ Failed to save profile: ${detail}`, ok: false });
    }
  };

  const busy = saving || avatarUploading || cvUploading;

  return (
    <div>
      <div className="admin-header">
        <h1>Edit Profile</h1>
        <p style={{ color: 'var(--muted)', marginTop: 6 }}>
          Changes are saved to MongoDB and files are stored on Cloudinary
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">

        {/* ── File uploads ── */}
        <div className="admin-card">
          <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Media Uploads</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <FileUploadBlock
              label="Profile Picture"
              hint="Accepted: JPG, PNG, WebP, GIF — max 10 MB. Stored on Cloudinary, persists across deploys."
              accept="image/*"
              uploading={avatarUploading}
              currentUrl={form.avatarUrl}
              previewType="image"
              onUpload={handleAvatarUpload}
              onDelete={handleAvatarDelete}
            />
            <FileUploadBlock
              label="CV / Resume"
              hint="Accepted: PDF — max 10 MB. The download link on your portfolio updates automatically."
              accept=".pdf"
              uploading={cvUploading}
              currentUrl={form.cvUrl}
              previewType="document"
              onUpload={handleCvUpload}
              onDelete={handleCvDelete}
            />
          </div>
        </div>

        {/* ── Personal Info ── */}
        <div className="admin-card">
          <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Personal Info</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div><label>Full Name</label><input value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label>Title / Role</label><input value={form.title} onChange={e => set('title', e.target.value)} /></div>
          </div>
          <label>Tagline (hero heading)</label>
          <input value={form.tagline} onChange={e => set('tagline', e.target.value)} />
          <label>Bio (hero subtext)</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.available}
              onChange={e => set('available', e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            Available for opportunities
          </label>
        </div>

        {/* ── Stats ── */}
        <div className="admin-card">
          <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Stats</h2>
          {form.stats.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 12px', alignItems: 'start' }}>
              <div><label>Label</label><input value={s.label} onChange={e => setStat(i, 'label', e.target.value)} /></div>
              <div><label>Value</label><input type="number" value={s.value} onChange={e => setStat(i, 'value', e.target.value)} style={{ width: 80 }} /></div>
              <div><label>Suffix</label><input value={s.suffix || ''} onChange={e => setStat(i, 'suffix', e.target.value)} style={{ width: 60 }} /></div>
            </div>
          ))}
        </div>

        {/* ── Contact & Links ── */}
        <div className="admin-card">
          <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Contact & Links</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div><label>Email</label><input value={form.email} onChange={e => set('email', e.target.value)} type="email" /></div>
            <div><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><label>LinkedIn URL</label><input value={form.linkedin} onChange={e => set('linkedin', e.target.value)} /></div>
            <div><label>GitHub URL</label><input value={form.github} onChange={e => set('github', e.target.value)} /></div>
          </div>
        </div>

        {/* ── Status message ── */}
        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, fontSize: '.88rem', fontWeight: 500,
            background: msg.ok ? 'rgba(74,222,128,.08)' : 'rgba(248,113,113,.08)',
            border: `1px solid ${msg.ok ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)'}`,
            color: msg.ok ? '#4ade80' : '#f87171',
          }}>
            {msg.text}
          </div>
        )}

        <div className="admin-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
