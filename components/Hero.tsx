'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import TypewriterEffect from './TypewriterEffect';

interface Stat { label: string; value: number; suffix: string; }

interface HeroProps {
  name: string;
  tagline: string;
  bio: string;
  available: boolean;
  stats: Stat[];
  cvUrl?: string;
  avatarUrl?: string;
}

export default function Hero({ name, tagline, bio, available, stats, cvUrl, avatarUrl }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  // ref for the orbiting dot
  const orbitDotRef = useRef<HTMLDivElement>(null);

  // Count-up animation
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-count]');
    if (!els.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        const target = parseInt(el.getAttribute('data-count') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        if (reduceMotion) { el.textContent = target + suffix; return; }
        let start: number | null = null;
        const dur = 900;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          el.textContent = Math.floor(p * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Smooth orbiting dot via rAF — fixes the CSS jump glitch
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dot = orbitDotRef.current;
    if (!dot) return;
    let start: number | null = null;
    const PERIOD_MS = 12000; // one full revolution = 12 s
    let raf: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) % PERIOD_MS;
      const angle = (elapsed / PERIOD_MS) * 2 * Math.PI - Math.PI / 2; // start at top
      // radius = half the container size + the inset-[-12px] offset
      // The dashed ring is inset-[-12px] outside the avatar container.
      // Avatar container is min(320px, 80vw). We use 50% + 12px via CSS custom prop.
      const containerHalf = dot.closest('.orbit-container')?.clientWidth
        ? (dot.closest('.orbit-container') as HTMLElement).clientWidth / 2
        : 160;
      const r = containerHalf + 12; // matches inset-[-12px] dashed ring
      const cx = Math.cos(angle) * r;
      const cy = Math.sin(angle) * r;
      dot.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header className="hero wrap" id="hero" ref={heroRef}>
      {/*
        Mobile layout: photo first (order-first), text second (order-last)
        Desktop layout: text left, photo right (grid cols, order restored via lg:)
        We use a flex-col wrapper that reverses on mobile only.
      */}
      <div className="w-full flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

        {/* ── Left / Text Column ── */}
        <div className="flex flex-col items-start text-left">
          {available && (
            <div className="tag fade-in d1 inline-flex items-center gap-2 text-[#9d6bff] font-mono text-sm mb-5 border border-[#9d6bff]/30 bg-[#9d6bff]/10 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
              available for opportunities
            </div>
          )}

          <h1 className="fade-in d2 font-bold font-['Space_Grotesk'] mb-5 tracking-tight"
              style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Building full‑stack
            <span className="block bg-gradient-to-r from-[#9d6bff] to-[#41c7ff] text-transparent bg-clip-text">
              systems that work.
            </span>
          </h1>

          <TypewriterEffect />

          <p className="fade-in d2 text-[#9099bb] mb-8 leading-[1.75]"
             style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', maxWidth: '46ch' }}>
            {bio}
          </p>

          <div className="flex flex-wrap gap-4 mb-10 fade-in d3">
            <a href="#projects" className="btn btn-primary">Explore projects</a>
            {cvUrl && cvUrl !== '#' && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Download CV
              </a>
            )}
          </div>

          <div className="flex gap-8 flex-wrap fade-in d4">
            {(stats || []).map((s, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <b className="font-['Space_Grotesk'] font-bold bg-gradient-to-r from-[#9d6bff] to-[#41c7ff] text-transparent bg-clip-text"
                   style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)' }}>
                  <span data-count={s?.value || 0} data-suffix={s?.suffix || ''}>0</span>
                </b>
                <span className="text-xs text-[#5a6291] leading-tight">{s?.label || ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right / Photo Column ── */}
        <div className="flex justify-center lg:justify-end fade-in d3 relative w-full lg:-mr-4 xl:-mr-8">
          {/* orbit-container — provides clientWidth for the JS dot radius calc */}
          <div
            className="orbit-container relative flex items-center justify-center w-[min(300px,78vw)] h-[min(300px,78vw)] lg:w-[345px] lg:h-[345px]"
          >
            {/* Outer Rotating Glowing Ring */}
            <div
              className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-[#41c7ff] to-purple-500 animate-[spin_10s_linear_infinite] shadow-[0_0_30px_rgba(168,85,247,0.4)] z-0"
              style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
            />

            {/* Dashed orbit ring (matches JS radius: half-width + 12px) */}
            <div className="absolute inset-[-12px] rounded-full border border-dashed border-purple-500/40 z-0" />

            {/* JS-driven orbiting dot — no CSS animation to avoid jump glitch */}
            <div
              ref={orbitDotRef}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-[#9d6bff] shadow-[0_0_12px_#9d6bff] z-20 pointer-events-none"
              style={{ marginTop: '-6px', marginLeft: '-6px' }}
            />

            {/* Avatar Core */}
            <div className="relative w-full h-full rounded-full border-4 border-[#242b52] bg-gradient-to-br from-[#1c2444] to-[#0c1020] flex items-center justify-center shadow-[inset_0_0_70px_rgba(157,107,255,0.18)] z-10 overflow-hidden">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 78vw, 345px" priority />
              ) : (
                <span
                  className="font-['Space_Grotesk'] font-bold text-[#eef0fb]/30 tracking-tighter"
                  style={{ fontSize: 'clamp(2.5rem, 12vw, 5rem)' }}
                >
                  {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'MP'}
                </span>
              )}
            </div>

            {/* Static accent dot (blue) */}
            <div className="absolute w-3 h-3 rounded-full bg-[#41c7ff] shadow-[0_0_12px_#41c7ff] bottom-[15%] left-[8%] z-20" />

            {/* Background Glow */}
            <div className="absolute inset-[-40px] rounded-full bg-gradient-to-r from-[#9d6bff]/30 to-[#41c7ff]/20 blur-[60px] -z-10 pointer-events-none" />
          </div>
        </div>

      </div>
    </header>
  );
}
