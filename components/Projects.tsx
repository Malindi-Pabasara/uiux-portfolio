'use client';

import { useEffect, useState } from 'react';
import RevealWrapper from './RevealWrapper';

interface Project { _id: string; title: string; description: string; tags: string[]; link?: string; badge?: string; imageUrl?: string; }

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from the database
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Tilt effect for cards
  useEffect(() => {
    if (isLoading) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    const cards = document.querySelectorAll<HTMLElement>('.tilt');
    const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-3px)`;
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
      title: 'AI-Based Inventory Management System',
      description: 'An integrated inventory management system featuring AI chatbot support, dynamic authentication forms, and structured directory layouts.',
      tags: ['HTML', 'JavaScript', 'Node.js'],
      badge: 'AI / WEB',
      link: ''
    },
    {
      _id: '2',
      title: 'Online Clothing Storefront',
      description: 'Modern e-commerce storefront layout featuring interactive wireframes and fully responsive UI prototypes.',
      tags: ['HTML', 'Tailwind CSS', 'UI/UX'],
      badge: 'FRONTEND',
      link: 'https://github.com'
    }
  ];

  const displayItems = projects.length > 0 ? projects : defaultProjects;

  return (
    <section id="projects">
      <div className="wrap">
        <p className="eyebrow">projects</p>
        <h2 className="sec-title">Featured work</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {isLoading ? (
            // Loading Skeleton
            <>
              {[1, 2].map((skel) => (
                <div key={skel} className="bg-gray-900/40 border border-gray-700/50 rounded-xl overflow-hidden h-full flex flex-col animate-pulse">
                  <div className="h-56 bg-gray-800/40"></div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-6"></div>
                    <div className="flex gap-2 mb-6">
                      <div className="h-6 w-16 bg-gray-700/50 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-700/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Projects Render
            displayItems.map((proj) => (
              <RevealWrapper key={proj._id} className="tilt h-full">
                <div className="bg-gray-900/40 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-all backdrop-blur-sm flex flex-col h-full group">
                  {/* Header / Image Area */}
                  <div className="relative h-56 bg-gray-800/30 flex items-center justify-center border-b border-gray-700/50">
                    <div className="absolute top-4 right-4 px-2 py-1 text-[10px] font-bold tracking-wider border border-gray-500/50 text-gray-400 rounded bg-gray-900/50">
                      {proj.badge || 'WEB'}
                    </div>
                    {proj.imageUrl ? (
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-gray-600 group-hover:text-purple-400/50 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{proj.title}</h3>
                    <p className="text-sm text-gray-300 mb-6 flex-1">{proj.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(proj.tags || []).map((t) => (
                        <span key={t} className="px-3 py-1 border border-gray-500 rounded-full text-xs text-gray-300">
                          {t}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-auto h-6">
                      {proj.link && proj.link !== '#' && (
                        <a href={proj.link} className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors" target="_blank" rel="noopener noreferrer">
                          <span>Live Project</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                          </svg>
                        </a>
                      )}
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
