'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FeedbackItem {
  _id: string;
  projectId: string;
  projectTitle: string;
  userName: string;
  userEmail: string;
  rating: number;
  message: string;
  createdAt: string;
}

const STAR_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    const role = (session?.user as any)?.role;
    if (!session || role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchFeedbacks();
  }, [session, status]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to load feedback.');
        return;
      }
      const data = await res.json().catch(() => ([]));
      setFeedbacks(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter
    ? feedbacks.filter((f) =>
        f.projectTitle.toLowerCase().includes(filter.toLowerCase()) ||
        f.userName.toLowerCase().includes(filter.toLowerCase()) ||
        f.userEmail.toLowerCase().includes(filter.toLowerCase())
      )
    : feedbacks;

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f59e0b' : 'var(--border)', fontSize: '1rem' }}>★</span>
    ));

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: 'var(--muted)' }}>Loading feedback…</div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Project Feedback</h1>
        <p style={{ color: 'var(--muted)', marginTop: 6 }}>
          Private user feedback — visible only to admins
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        {[
          { label: 'Total Submissions', value: feedbacks.length, color: 'var(--purple)' },
          { label: 'Average Rating', value: `${avgRating} / 5`, color: '#f59e0b' },
          { label: 'Projects Reviewed', value: new Set(feedbacks.map(f => f.projectId)).size, color: 'var(--blue)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="admin-card" style={{ flex: '1 1 160px', minWidth: 140 }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 700, color, fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="search"
          placeholder="Filter by project, name, or email…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: 'var(--panel-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 14px',
            color: 'var(--fg)',
            fontSize: '.9rem',
            width: '100%',
            maxWidth: 380,
            outline: 'none',
          }}
        />
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '14px 18px', color: '#f87171', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--muted)' }}>
            {feedbacks.length === 0 ? 'No feedback submitted yet.' : 'No results match your filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((fb) => (
            <div
              key={fb._id}
              className="admin-card"
              style={{ borderLeft: `3px solid ${STAR_COLORS[fb.rating]}` }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '.95rem' }}>{fb.userName}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{fb.userEmail}</span>
                    <span style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: '.75rem', color: 'var(--muted)' }}>
                      {fb.projectTitle}
                    </span>
                  </div>
                  <div style={{ marginBottom: 10 }}>{renderStars(fb.rating)}</div>
                  <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--fg)', lineHeight: 1.6 }}>{fb.message}</p>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '.78rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {new Date(fb.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
