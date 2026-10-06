'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Certifications from '@/components/Certifications';
import Education from '@/components/Education';
import ProjectFeedback from '@/components/ProjectFeedback';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [data, setData] = useState<{
    profile: any;
    experience: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
    education: any[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Hardened fetch: only parse JSON if the response is actually JSON.
      // On Vercel, a misconfigured env var or cold-start error returns an HTML
      // error page (<!DOCTYPE …>), which causes "Unexpected token '<'" if we
      // blindly call .json() on it.
      const safeFetch = async (url: string, fallback: any) => {
        try {
          const r = await fetch(`${url}?t=${Date.now()}`);
          if (!r.ok) return fallback;
          const ct = r.headers.get('content-type') ?? '';
          if (!ct.includes('application/json')) return fallback;
          return await r.json();
        } catch {
          return fallback;
        }
      };

      const [profile, experience, skills, projects, certifications, education] = await Promise.all([
        safeFetch('/api/profile', {}),
        safeFetch('/api/experience', []),
        safeFetch('/api/skills', []),
        safeFetch('/api/projects', []),
        safeFetch('/api/certifications', []),
        safeFetch('/api/education', []),
      ]);

      setData({ profile, experience, skills, projects, certifications, education });
    }
    fetchData();
  }, []);

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--muted)' }}>Loading portfolio...</div>
      </div>
    );
  }

  const p = data.profile || {};
  const feedbackProjects = (data.projects || []).map((proj: any) => ({ _id: proj._id, title: proj.title }));

  return (
    <>
      {/* Glow orbs */}
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />

      <Navbar />

      <Hero
        name={p?.name || 'Malindi Pabasara'}
        tagline={p?.tagline || 'Building full‑stack systems that work.'}
        bio={p?.bio || 'IT professional and HNDIT candidate specialising in full-stack web and mobile development.'}
        available={p?.available ?? true}
        stats={p?.stats || []}
        cvUrl={p?.cvUrl || ''}
        avatarUrl={p?.avatarUrl || p?.profilePicture || ''}
      />

      <div className="wrap"><div className="divider" /></div>
      <About />

      <div className="wrap"><div className="divider" /></div>
      <Experience items={data.experience} />

      <div className="wrap"><div className="divider" /></div>
      <Skills items={data.skills} />

      <div className="wrap"><div className="divider" /></div>
      <Projects />

      <div className="wrap"><div className="divider" /></div>
      <Certifications items={data.certifications} />

      <div className="wrap"><div className="divider" /></div>
      <Education items={data.education} />

      <div className="wrap"><div className="divider" /></div>
      <ProjectFeedback projects={feedbackProjects} />

      <Footer profile={p} />
    </>
  );
}
