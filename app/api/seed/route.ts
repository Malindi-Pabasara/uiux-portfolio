import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import Profile from '@/models/Profile';
import Experience from '@/models/Experience';
import Skill from '@/models/Skill';
import Project from '@/models/Project';
import Certification from '@/models/Certification';
import Education from '@/models/Education';
import bcrypt from 'bcryptjs';

// POST /api/seed  – only works if SEED_SECRET header matches env variable
export async function POST(req: Request) {
  const secret = req.headers.get('x-seed-secret');
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  // Admin
  const existing = await Admin.findOne({ username: 'admin' });
  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
    await Admin.create({ username: 'admin', password: hashed });
  }

  // Profile
  await Profile.deleteMany({});
  await Profile.create({
    name: 'Malindi Pabasara',
    title: 'UI/UX Designer / HNDIT Candidate',
    tagline: 'Creating simple, user-friendly digital experiences.',
    bio: 'HNDIT student with a strong interest in UI/UX design and creating simple, user-friendly digital experiences. Skilled in Figma, wireframing, prototyping, user flows, and visual interface design.',
    available: true,
    stats: [
      { label: 'Design Projects', value: 3, suffix: '' },
      { label: 'Certifications', value: 3, suffix: '' },
      { label: 'Design Tools', value: 5, suffix: '+' },
    ],
    email: 'malindi.wpm@gmail.com',
    phone: '+94742106298',
    linkedin: 'https://linkedin.com/in/Malindi-Pabasara',
    github: 'https://github.com/Malindi-Pabasara',
    cvUrl: '#',
  });

  // Experience
  await Experience.deleteMany({});
  await Experience.create({
    title: 'Data Entry Operator',
    company: 'Vasana Valuation Associates',
    period: 'Sep 2023 - Aug 2024',
    bullets: [
      'Verifying information for accuracy and completeness.',
      'Organizing documents and maintaining structured filing systems.',
      'Maintaining digital and physical records for the organization.',
    ],
    order: 0,
  });

  // Skills
  await Skill.deleteMany({});
  await Skill.insertMany([
    { category: 'Design', items: ['Figma', 'Canva', 'Wireframing', 'Prototyping', 'User Flow', 'UI Design', 'Responsive Design', 'Typography', 'Color & Layout'], order: 0 },
    { category: 'UX', items: ['Basic User Research', 'User Personas', 'Usability Principles', 'Design Thinking'], order: 1 },
    { category: 'Technical', items: ['HTML', 'CSS', 'JavaScript', 'Basic Git/GitHub'], order: 2 },
  ]);

  // Projects
  await Project.deleteMany({});
  await Project.insertMany([
    {
      title: 'Optical Service System',
      description: 'A user-friendly interface to manage customers, appointments and optical service records end to end.',
      tags: ['Figma', 'Wireframing', 'UI Design', 'Prototyping'],
      link: '#',
      prototypeUrl: '#',
      order: 0,
    },
    {
      title: 'Hospital System',
      description: 'A system to manage patient information, appointments and hospital records for clinical staff.',
      tags: ['Figma', 'User Flow', 'Responsive Design'],
      link: '#',
      prototypeUrl: '#',
      order: 1,
    },
    {
      title: 'Tea Shop Management',
      description: 'A web-based system to manage products, orders and customer information for a small retail shop.',
      tags: ['Wireframing', 'Canva', 'UI Design'],
      link: '#',
      prototypeUrl: '#',
      order: 2,
    },
  ]);

  // Certifications
  await Certification.deleteMany({});
  await Certification.insertMany([
    { title: 'Certificate in Web Design & Python', issuer: 'University of Moratuwa', year: '', order: 0 },
    { title: 'Certificate in Information Technology', issuer: 'Open University', year: '', order: 1 },
    { title: 'Certificate in English', issuer: 'Sabaragamuwa University', year: '', order: 2 },
  ]);

  // Education
  await Education.deleteMany({});
  await Education.create({
    degree: 'Higher National Diploma in Information Technology (HNDIT)',
    institution: 'Advanced Technological Institute, Ratnapura',
    period: 'Expected 2026',
    details: 'Focus on technology foundations, software engineering, and systems design.',
    active: true,
    order: 0,
  });

  return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
}
