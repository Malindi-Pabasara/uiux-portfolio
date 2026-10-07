'use client';

import { useEffect, useState } from 'react';
import RevealWrapper from './RevealWrapper';

interface Project {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  caseStudyUrl?: string;
  prototypeUrl?: string;
  imageUrl?: string;
}

// Gradient palettes cycle per card for visual variety
const CARD_GRADIENTS = [
  'from-[#9d6bff]/20 via-[#6d28d9]/10 to-[#41c7ff]/10',
  'from-[#41c7ff]/20 via-[#9d6bff]/10 to-[#6d28d9]/10',
  'from-[#6d28d9]/20 via-[#41c7ff]/10 to-[#9d6bff]/15',
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // 3D tilt micro-interaction
  useEffect(() => {
    if (isLoading) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    const cards = document.querySelectorAll<HTMLElement>('.proj-case-card');
    const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-4px)`;
      };
      const leave = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      handlers.push({ el: card, move, leave });
    });
    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, [isLoading, projects]);

  const defaultProjects: Project[] = [
    {
      _id: '1',
      title: 'Optical Service System',
      description: 'A user-friendly interface to manage customers, appointments and optical service records end to end.',
      tags: ['Figma', 'Wireframing', 'UI Design', 'Prototyping'],
      caseStudyUrl: '#',
      prototypeUrl: '#',
    },
    {
      _id: '2',
      title: 'Hospital System',
      description: 'A system to manage patient information, appointments and hospital records for clinical staff.',
      tags: ['Figma', 'User Flow', 'Responsive Design'],
      caseStudyUrl: '#',
      prototypeUrl: '#',
    },
    {
      _id: '3',
      title: 'Tea Shop Management',
      description: 'A web-based system to manage products, orders and customer information for a small retail shop.',
      tags: ['Wireframing', 'Canva', 'UI Design'],
      caseStudyUrl: '#',
      prototypeUrl: '#',
    },
  ];

  const displayItems = projects.length > 0 ? projects : defaultProjects;

  // Unique wireframe SVG placeholders per card
  const placeholders = [
    <svg key="p1" className="w-full h-full" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="24" width="352" height="192" rx="10" stroke="#9d6bff" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="6 4"/>
      <rect x="40" y="40" width="100" height="60" rx="6" fill="#9d6bff" fillOpacity="0.08" stroke="#9d6bff" strokeOpacity="0.3" strokeWidth="1"/>
      <rect x="156" y="40" width="84" height="28" rx="5" fill="#41c7ff" fillOpacity="0.07" stroke="#41c7ff" strokeOpacity="0.3" strokeWidth="1"/>
      <rect x="156" y="76" width="84" height="24" rx="5" fill="#41c7ff" fillOpacity="0.05" stroke="#41c7ff" strokeOpacity="0.2" strokeWidth="1"/>
      <rect x="40" y="116" width="216" height="10" rx="3" fill="#9099bb" fillOpacity="0.12"/>
      <rect x="40" y="132" width="176" height="10" rx="3" fill="#9099bb" fillOpacity="0.08"/>
      <rect x="40" y="148" width="196" height="10" rx="3" fill="#9099bb" fillOpacity="0.06"/>
      <rect x="40" y="172" width="80" height="28" rx="6" fill="#9d6bff" fillOpacity="0.18" stroke="#9d6bff" strokeOpacity="0.4" strokeWidth="1"/>
      <rect x="132" y="172" width="68" height="28" rx="6" fill="none" stroke="#9d6bff" strokeOpacity="0.3" strokeWidth="1"/>
      <circle cx="308" cy="80" r="46" fill="none" stroke="#41c7ff" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="5 3"/>
      <circle cx="308" cy="80" r="30" fill="#41c7ff" fillOpacity="0.06" stroke="#41c7ff" strokeOpacity="0.25" strokeWidth="1"/>
      <path d="M295 80 L308 67 L321 80 L308 93 Z" fill="#41c7ff" fillOpacity="0.15"/>
    </svg>,
    <svg key="p2" className="w-full h-full" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="96" width="76" height="44" rx="8" fill="#9d6bff" fillOpacity="0.12" stroke="#9d6bff" strokeOpacity="0.35" strokeWidth="1.5"/>
      <text x="66" y="123" textAnchor="middle" fill="#9d6bff" fillOpacity="0.7" fontSize="10" fontFamily="monospace">Start</text>
      <line x1="104" y1="118" x2="148" y2="118" stroke="#9d6bff" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="148" y="92" width="100" height="52" rx="8" fill="#141a38" stroke="#41c7ff" strokeOpacity="0.4" strokeWidth="1.5"/>
      <text x="198" y="123" textAnchor="middle" fill="#41c7ff" fillOpacity="0.8" fontSize="9" fontFamily="monospace">UI Screen</text>
      <line x1="248" y1="118" x2="292" y2="118" stroke="#41c7ff" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="292" y="96" width="76" height="44" rx="22" fill="#9d6bff" fillOpacity="0.18" stroke="#9d6bff" strokeOpacity="0.5" strokeWidth="1.5"/>
      <text x="330" y="123" textAnchor="middle" fill="#9d6bff" fillOpacity="0.9" fontSize="9" fontFamily="monospace">Done</text>
      <rect x="28" y="36" width="340" height="40" rx="6" fill="#9d6bff" fillOpacity="0.06" stroke="#9d6bff" strokeOpacity="0.15" strokeWidth="1"/>
      <rect x="40" y="48" width="120" height="16" rx="3" fill="#9099bb" fillOpacity="0.12"/>
      <rect x="172" y="48" width="80" height="16" rx="3" fill="#9099bb" fillOpacity="0.08"/>
      <circle cx="366" cy="56" r="8" fill="#41c7ff" fillOpacity="0.15" stroke="#41c7ff" strokeOpacity="0.4" strokeWidth="1"/>
    </svg>,
    <svg key="p3" className="w-full h-full" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad3a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9d6bff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#41c7ff" stopOpacity="0.15"/>
        </linearGradient>
      </defs>
      <rect x="24" y="24" width="160" height="100" rx="10" fill="url(#grad3a)" stroke="#9d6bff" strokeOpacity="0.2" strokeWidth="1"/>
      <rect x="24" y="136" width="36" height="36" rx="6" fill="#9d6bff" fillOpacity="0.7"/>
      <rect x="68" y="136" width="36" height="36" rx="6" fill="#41c7ff" fillOpacity="0.5"/>
      <rect x="112" y="136" width="36" height="36" rx="6" fill="#6d28d9" fillOpacity="0.6"/>
      <rect x="156" y="136" width="36" height="36" rx="6" fill="#9099bb" fillOpacity="0.3"/>
      <rect x="200" y="24" width="172" height="30" rx="5" fill="#9099bb" fillOpacity="0.1"/>
      <rect x="200" y="62" width="172" height="20" rx="4" fill="#9099bb" fillOpacity="0.07"/>
      <rect x="200" y="90" width="140" height="16" rx="4" fill="#9099bb" fillOpacity="0.05"/>
      <rect x="200" y="112" width="100" height="16" rx="4" fill="#9099bb" fillOpacity="0.04"/>
      <rect x="200" y="136" width="80" height="36" rx="8" fill="#9d6bff" fillOpacity="0.2" stroke="#9d6bff" strokeOpacity="0.5" strokeWidth="1.5"/>
      <rect x="288" y="136" width="80" height="36" rx="8" fill="none" stroke="#9d6bff" strokeOpacity="0.3" strokeWidth="1.5"/>
      <rect x="24" y="188" width="348" height="28" rx="6" fill="#9099bb" fillOpacity="0.05" stroke="#242b52" strokeWidth="1"/>
    </svg>,
  ];

  return (
    <section id="projects">
      <div className="wrap">
        <p className="eyebrow">projects</p>
        <h2 className="sec-title">Featured work</h2>

        <div className="proj-case-grid">
          {isLoading ? (
            <>
              {[1, 2, 3].map((skel) => (
                <div key={skel} className="proj-case-skeleton">
                  <div className="proj-case-skeleton-img" />
                  <div className="proj-case-skeleton-body">
                    <div className="h-6 bg-[#242b52] rounded w-3/4 mb-4 animate-pulse" />
                    <div className="h-4 bg-[#242b52] rounded w-full mb-2 animate-pulse" />
                    <div className="h-4 bg-[#242b52] rounded w-5/6 mb-6 animate-pulse" />
                    <div className="flex gap-2 mb-6">
                      {[1,2,3].map(p => <div key={p} className="h-6 w-20 bg-[#242b52] rounded-full animate-pulse" />)}
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 w-36 bg-[#242b52] rounded-lg animate-pulse" />
                      <div className="h-10 w-32 bg-[#242b52] rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            displayItems.map((proj, idx) => (
              <RevealWrapper key={proj._id}>
                <div className="proj-case-card">

                  {/* Image / Preview Area */}
                  <div className={`proj-case-img-wrap bg-gradient-to-br ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]}`}>
                    {proj.imageUrl ? (
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="proj-case-img"
                      />
                    ) : (
                      <div className="proj-case-placeholder">
                        {placeholders[idx % placeholders.length]}
                      </div>
                    )}

                    {/* Category badge top-left */}
                    <div className="proj-case-badge">
                      <span className="proj-case-badge-dot" />
                      UI/UX
                    </div>

                    {/* Hover shimmer overlay */}
                    <div className="proj-case-shimmer" />
                  </div>

                  {/* Content Area */}
                  <div className="proj-case-body">

                    {/* Tags */}
                    <div className="proj-case-tags">
                      {(proj.tags || []).map((tag) => (
                        <span key={tag} className="proj-case-tag">{tag}</span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="proj-case-title">{proj.title}</h3>

                    {/* Description */}
                    <p className="proj-case-desc">{proj.description}</p>

                    {/* Action buttons */}
                    <div className="proj-case-actions">
                      <a
                        href={proj.caseStudyUrl && proj.caseStudyUrl !== '#' ? proj.caseStudyUrl : undefined}
                        className={`proj-case-btn-primary${!proj.caseStudyUrl || proj.caseStudyUrl === '#' ? ' proj-case-btn-disabled' : ''}`}
                        {...(proj.caseStudyUrl && proj.caseStudyUrl !== '#'
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : { 'aria-disabled': 'true' })}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        View Case Study
                      </a>
                      <a
                        href={proj.prototypeUrl && proj.prototypeUrl !== '#' ? proj.prototypeUrl : undefined}
                        className={`proj-case-btn-ghost${!proj.prototypeUrl || proj.prototypeUrl === '#' ? ' proj-case-btn-disabled' : ''}`}
                        {...(proj.prototypeUrl && proj.prototypeUrl !== '#'
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : { 'aria-disabled': 'true' })}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        View Prototype
                      </a>
                    </div>
                  </div>

                </div>
              </RevealWrapper>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
