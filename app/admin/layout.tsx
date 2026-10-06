'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '⬛' },
  { href: '/admin/profile', label: 'Profile', icon: '👤' },
  { href: '/admin/projects', label: 'Projects', icon: '📁' },
  { href: '/admin/skills', label: 'Skills', icon: '⚙️' },
  { href: '/admin/experience', label: 'Experience', icon: '💼' },
  { href: '/admin/certifications', label: 'Certifications', icon: '🏅' },
  { href: '/admin/education', label: 'Education', icon: '🎓' },
  { href: '/admin/feedback', label: 'Feedback', icon: '💬' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/admin/login'); return; }
    if (session && (session.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--muted)' }}>Loading…</div>
      </div>
    );
  }
  if (!session || (session.user as any)?.role !== 'admin') return null;

  const currentLabel = NAV.find(n => n.href === pathname)?.label ?? 'Admin';

  return (
    <div className="admin-layout" style={{ position: 'relative' }}>

      {/* ── Mobile top bar ── */}
      <div className="flex md:hidden items-center justify-between px-4 h-14 bg-[var(--panel-2)] border-b border-[var(--border)] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="brand-mark" style={{ width: 32, height: 32, fontSize: '.9rem' }}>M</span>
          <span style={{ fontWeight: 600, fontSize: '.95rem' }}>{currentLabel}</span>
        </div>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(prev => !prev)}
          style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'var(--muted)', borderRadius: 2 }} />
          ))}
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="admin-sidebar"
        style={{
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
      >
        {/* Desktop brand header */}
        <div className="brand hidden md:flex" style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
          <span className="brand-mark">M</span>
          <span>Admin</span>
        </div>
        {/* Mobile close button inside sidebar */}
        <div className="flex md:hidden items-center justify-between px-5 py-4 border-b border-[var(--border)] mb-2">
          <div className="flex items-center gap-2">
            <span className="brand-mark" style={{ width: 32, height: 32, fontSize: '.9rem' }}>M</span>
            <span style={{ fontWeight: 600 }}>Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        </div>

        <ul className="admin-nav">
          {NAV.map(({ href, label, icon }) => (
            <li key={href}>
              <Link href={href} className={pathname === href ? 'active' : ''}>
                <span>{icon}</span>
                {label}
                {label === 'Feedback' && (
                  <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(157,107,255,0.18)', color: 'var(--purple)', border: '1px solid rgba(157,107,255,0.3)', borderRadius: 4, padding: '1px 5px' }}>
                    Private
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 'auto', padding: '0 16px 16px' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', fontSize: '.85rem', minHeight: 44 }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
