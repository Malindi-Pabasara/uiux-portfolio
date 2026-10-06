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
    title: 'Full-Stack Developer',
    tagline: 'Building full‑stack systems that work.',
    bio: 'IT professional and HNDIT candidate specialising in full-stack web and mobile development — Java, JavaScript, PHP and Flutter, from database to interface.',
    available: true,
    stats: [
      { label: 'systems built', value: 3, suffix: '' },
      { label: 'certifications', value: 3, suffix: '' },
      { label: 'tools & languages', value: 10, suffix: '+' },
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
    period: '',
    bullets: [
      'Managed day-to-day data entry with a focus on accuracy and consistency.',
      "Maintained confidential records in line with the firm's data-handling standards.",
      'Handled digital documentation, keeping files organised and easy to retrieve.',
    ],
    order: 0,
  });

  // Skills
  await Skill.deleteMany({});
  await Skill.insertMany([
    { category: 'Frontend & UI/UX', items: ['HTML', 'CSS', 'JavaScript', 'Figma'], order: 0 },
    { category: 'Backend & Mobile', items: ['Java', 'PHP', 'Node.js', 'Flutter', 'Dart', 'Kotlin'], order: 1 },
    { category: 'Database & Tools', items: ['MySQL', 'Postman', 'Git', 'GitHub'], order: 2 },
  ]);

  // Projects
  await Project.deleteMany({});
  await Project.insertMany([
    {
      title: 'Optical Service System',
      description: 'A user-friendly interface to manage customers, appointments and optical service records end to end.',
      tags: ['HTML/CSS', 'Node.js', 'MySQL'],
      link: '#',
      order: 0,
    },
    {
      title: 'Hospital System',
      description: 'A system to manage patient information, appointments and hospital records for clinical staff.',
      tags: ['PHP', 'MySQL'],
      link: '#',
      order: 1,
    },
    {
      title: 'Tea Shop Management',
      description: 'A web-based system to manage products, orders and customer information for a small retail shop.',
      tags: ['JavaScript'],
      link: '#',
      order: 2,
    },
  ]);

  // Certifications
  await Certification.deleteMany({});
  await Certification.insertMany([
    { title: 'Certificate in Web Design & Python', issuer: 'University of Moratuwa', year: '2026', order: 0 },
    { title: 'Certificate in Information Technology', issuer: 'Open University of Sri Lanka', year: '2023', order: 1 },
  ]);

  // Education
  await Education.deleteMany({});
  await Education.create({
    degree: 'Higher National Diploma in Information Technology (HNDIT)',
    institution: 'ATI Ratnapura — SLIATE',
    period: '2024–2026',
    details: 'Core focus: OOP, DBMS, Systems Analysis, IT Infrastructure.',
    active: true,
    order: 0,
  });

  return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
}
