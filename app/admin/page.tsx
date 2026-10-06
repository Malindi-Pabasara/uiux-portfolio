'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  projects: number;
  skills: number;
  experience: number;
  certifications: number;
  education: number;
  feedback: number;
}

/* ── Per-card config ─────────────────────────────────────── */
const CARDS = [
  {
    key: 'projects' as keyof Stats,
    label: 'Projects',
    subtitle: 'in portfolio',
    href: '/admin/projects',
    accent: '#41c7ff',          // blue
    bg: 'rgba(65,199,255,.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    key: 'skills' as keyof Stats,
    label: 'Skill Categories',
    subtitle: 'tech stacks tracked',
    href: '/admin/skills',
    accent: '#9d6bff',          // purple
    bg: 'rgba(157,107,255,.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    key: 'experience' as keyof Stats,
    label: 'Experience',
    subtitle: 'work entries',
    href: '/admin/experience',
    accent: '#4ade80',          // green
    bg: 'rgba(74,222,128,.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
  },
  {
    key: 'certifications' as keyof Stats,
    label: 'Certifications',
    subtitle: 'credentials earned',
    href: '/admin/certifications',
    accent: '#f59e0b',          // amber
    bg: 'rgba(245,158,11,.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
      </svg>
    ),
  },
  {
    key: 'education' as keyof Stats,
    label: 'Education',
    subtitle: 'academic records',
    href: '/admin/education',
    accent: '#f87171',          // red
    bg: 'rgba(248,113,113,.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    key: 'feedback' as keyof Stats,
    label: 'Feedback',
    subtitle: 'private responses',
    href: '/admin/feedback',
    accent: '#a78bfa',          // violet
    bg: 'rgba(167,139,250,.08)',
    badge: '🔒 Private',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

/* ── Component ───────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const safeFetch = async (url: string) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return [];
        const ct = r.headers.get('content-type') ?? '';
        return ct.includes('application/json') ? r.json() : [];
      } catch { return []; }
    };

    Promise.all([
      safeFetch('/api/projects'),
      safeFetch('/api/skills'),
      safeFetch('/api/experience'),
      safeFetch('/api/certifications'),
      safeFetch('/api/education'),
      safeFetch('/api/feedback'),
    ]).then(([projects, skills, experience, certifications, education, feedback]) => {
      setStats({
        projects:       Array.isArray(projects)       ? projects.length       : 0,
        skills:         Array.isArray(skills)         ? skills.length         : 0,
        experience:     Array.isArray(experience)     ? experience.length     : 0,
        certifications: Array.isArray(certifications) ? certifications.length : 0,
        education:      Array.isArray(education)      ? education.length      : 0,
        feedback:       Array.isArray(feedback)       ? feedback.length       : 0,
      });
    });

    // Terminal cursor blink
    const t = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* ── Header ── */}
      <div className="admin-header">
        <h1 style={{ letterSpacing: '-.01em' }}>Dashboard Overview</h1>
        {/* Terminal status line */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '.82rem',
          color: '#4ade80',
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span style={{ opacity: .6 }}>&gt;</span>
          {' '}System status nominal
          <span style={{ opacity: blink ? 1 : 0, transition: 'opacity .1s' }}>_</span>
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
        gap: 14,
        marginBottom: 28,
      }}>
        {CARDS.map(({ key, label, subtitle, href, accent, bg, badge, icon }) => {
          const count = stats ? stats[key] : null;
          return (
            <Link href={href} key={key} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 20px',
                  borderRadius: 14,
                  border: `1px solid ${accent}33`,   /* 20% opacity accent border */
                  background: 'var(--panel-2)',
                  cursor: 'pointer',
                  transition: 'border-color .2s, transform .2s, box-shadow .2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = accent;
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow = `0 8px 24px -8px ${accent}44`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${accent}33`;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                {/* Subtle corner glow */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 80, height: 80,
                  background: `radial-gradient(circle at top right, ${accent}18, transparent 70%)`,
                  pointerEvents: 'none',
                }} />

                {/* Icon box */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: bg,
                  border: `1px solid ${accent}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accent,
                }}>
                  {icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '.82rem', fontWeight: 600, color: 'var(--text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '.73rem', color: 'var(--muted-2)', marginTop: 2 }}>
                    {badge ? (
                      <span style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>{badge}</span>
                    ) : subtitle}
                  </div>
                </div>

                {/* Big count */}
                <div style={{
                  fontSize: '2rem', fontWeight: 700, color: accent,
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1, flexShrink: 0, minWidth: 40, textAlign: 'right',
                }}>
                  {count ?? (
                    <span style={{ fontSize: '1.4rem', opacity: .4 }}>—</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Quick Links ── */}
      <div className="admin-card">
        <h2 style={{ margin: '0 0 14px', fontSize: '1rem', letterSpacing: '-.01em' }}>Quick links</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a href="/" target="_blank" className="btn btn-ghost" style={{ fontSize: '.85rem' }}>View portfolio ↗</a>
          <Link href="/admin/profile" className="btn btn-primary" style={{ fontSize: '.85rem' }}>Edit profile</Link>
          <Link href="/admin/feedback" className="btn btn-ghost" style={{ fontSize: '.85rem' }}>View feedback 💬</Link>
        </div>
      </div>
    </div>
  );
}
