'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const spotRef  = useRef<HTMLDivElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible,  setIsVisible]  = useState(false);

  const ringPos  = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      // Dot: snap immediately to viewport coords
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      // Spotlight glow: also snap immediately, fixed to viewport
      if (spotRef.current) {
        spotRef.current.style.left = `${e.clientX}px`;
        spotRef.current.style.top  = `${e.clientY}px`;
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);

    // rAF loop: ring lerp-follows the mouse
    let raf: number;
    const render = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
      if (ringRef.current) {
        const s = isHovering ? 1.5 : 1;
        ringRef.current.style.transform =
          `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${s})`;
      }
      raf = requestAnimationFrame(render);
    };
    render();

    // Hover detection: scale ring up over interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setIsHovering(
        t.tagName === 'A' || t.tagName === 'BUTTON' ||
        !!t.closest('a') || !!t.closest('button') ||
        t.classList.contains('cursor-pointer')
      );
    };
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover',  onMouseOver);
      cancelAnimationFrame(raf);
    };
  }, [isHovering]);

  return (
    <>
      {/* ── Global spotlight glow ──────────────────────────────────────
          Fixed to viewport, follows cursor on EVERY page. z-index 0 so
          it sits beneath content but above the dark body background.     */}
      <div
        ref={spotRef}
        style={{
          position:     'fixed',
          top:          0,
          left:         0,
          width:        '420px',
          height:       '420px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(157,107,255,.18), transparent 70%)',
          pointerEvents:'none',
          zIndex:       0,
          transform:    'translate(-50%, -50%)',
          opacity:       isVisible ? 1 : 0,
          transition:   'opacity .35s ease',
          filter:       'blur(2px)',
        }}
      />

      {/* ── Outer trailing ring ────────────────────────────────────── */}
      <div
        ref={ringRef}
        style={{
          position:     'fixed',
          top:          0,
          left:         0,
          width:        '32px',
          height:       '32px',
          border:       '1px solid #9d6bff',
          borderRadius: '50%',
          pointerEvents:'none',
          zIndex:       99999,
          marginLeft:   '-16px',
          marginTop:    '-16px',
          opacity:       isVisible ? (isHovering ? 0.85 : 0.45) : 0,
          background:    isHovering ? 'rgba(157,107,255,.12)' : 'transparent',
          transition:   'opacity .2s, background .2s',
        }}
      />

      {/* ── Inner solid dot ────────────────────────────────────────── */}
      <div
        ref={dotRef}
        style={{
          position:     'fixed',
          top:          0,
          left:         0,
          width:        '8px',
          height:       '8px',
          backgroundColor: '#9d6bff',
          borderRadius: '50%',
          pointerEvents:'none',
          zIndex:       100000,
          marginLeft:   '-4px',
          marginTop:    '-4px',
          opacity:       isVisible ? 1 : 0,
          transition:   'opacity .2s',
        }}
      />
    </>
  );
}
