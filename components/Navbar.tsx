'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const linksRef = useRef<HTMLUListElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const userRole = session?.user?.role;
  const isAdmin = userRole === 'admin';
  const isLoggedIn = status === 'authenticated' && !!session?.user;

  // Active-link scroll tracker
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id], header[id]'));
    const setActive = () => {
      const pos = window.scrollY + 100;
      let current = '';
      sections.forEach((s) => { if (s.offsetTop <= pos) current = s.id; });
      linksRef.current?.querySelectorAll('a:not(.btn-ghost):not(.btn-primary)').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('#')) a.classList.toggle('active', href === `#${current}`);
      });
    };
    document.addEventListener('scroll', setActive, { passive: true });
    setActive();
    return () => document.removeEventListener('scroll', setActive);
  }, []);

  // Close mobile menu on route link click
  const closeMenu = () => setMenuOpen(false);

  const NAV_LINKS = ['about', 'experience', 'skills', 'projects', 'certifications', 'education'];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#080b16]/70 backdrop-blur-md border-b border-[#242b52]">
      <div className="wrap flex items-center justify-between h-[70px]">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 font-semibold text-[1.05rem] decoration-none shrink-0">
          <span className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#9d6bff] to-[#41c7ff] flex items-center justify-center font-bold text-[#080b16] font-['Space_Grotesk'] shadow-[0_4px_16px_rgba(157,107,255,0.4)]">
            M
          </span>
          <span className="hidden sm:block">Malindi Pabasara</span>
        </Link>

        {/* Desktop Center Nav */}
        <ul
          className="hidden md:flex items-center gap-6 bg-gray-800/40 border border-gray-700/50 rounded-full px-8 py-2.5 text-[0.92rem] text-[#9099bb] list-none m-0"
          ref={linksRef}
        >
          {NAV_LINKS.map((s) => (
            <li key={s}>
              <a href={`#${s}`} className="transition-all duration-300 hover:!text-purple-400 relative">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </a>
            </li>
          ))}
        </ul>

        {/* Right: Auth + Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  id="admin-panel-btn"
                  className="hidden sm:flex btn btn-ghost !py-1.5 !px-3 !text-[0.85rem] items-center gap-1.5 border border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  Admin
                </Link>
              )}
              <button
                id="logout-btn"
                onClick={() => signOut()}
                className="hidden sm:block btn btn-ghost !py-1.5 !px-3 !text-[0.85rem]"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost !py-1.5 !px-3 !text-[0.85rem] hover:!text-purple-400 transition-all duration-300">Login</Link>
              <Link href="/register" className="btn btn-primary !py-1.5 !px-3 !text-[0.85rem] hover:brightness-110 transition-all duration-300">Register</Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button
            aria-label="Toggle menu"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={`block h-0.5 w-6 bg-[#9099bb] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-[#9099bb] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-[#9099bb] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="bg-[#080b16]/95 backdrop-blur-md border-t border-[#242b52] px-6 py-4 flex flex-col gap-1">
          <ul ref={linksRef} className="list-none m-0 p-0 flex flex-col gap-1 mb-4">
            {NAV_LINKS.map((s) => (
              <li key={s}>
                <a
                  href={`#${s}`}
                  onClick={closeMenu}
                  className="block py-3 px-4 rounded-lg text-[#9099bb] hover:text-purple-400 hover:bg-white/5 transition-all duration-200 text-[0.95rem]"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile Auth */}
          <div className="border-t border-[#242b52] pt-4 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu} className="btn btn-ghost !py-3 !text-[0.9rem] w-full justify-center border border-purple-500/40 text-purple-300">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); closeMenu(); }}
                  className="btn btn-ghost !py-3 !text-[0.9rem] w-full justify-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} className="btn btn-ghost !py-3 !text-[0.9rem] w-full justify-center hover:!text-purple-400 transition-all duration-300">Login</Link>
                <Link href="/register" onClick={closeMenu} className="btn btn-primary !py-3 !text-[0.9rem] w-full justify-center">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
