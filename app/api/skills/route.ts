import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const portfolioType = searchParams.get('portfolioType') as 'Full-Stack' | 'UI/UX' | null;
    const query = portfolioType ? { portfolioType } : {};
    const skills = await Skill.find(query).sort({ order: 1 }).lean();
    return NextResponse.json(skills);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { category, items, order, portfolioType } = body;

    // Explicitly validate portfolioType: 'Full-Stack' | 'UI/UX'
    const validatedPortfolioType = portfolioType === 'UI/UX' ? 'UI/UX' : 'Full-Stack';

    const skill = await Skill.create({
      category,
      items: Array.isArray(items) ? items : [],
      order: typeof order === 'number' ? order : 0,
      portfolioType: validatedPortfolioType,
    });
    return NextResponse.json(skill, { status: 201 });
  } catch (err: any) {
    console.error('Error creating skill:', err);
    return NextResponse.json({ error: 'Failed to create skill', detail: err.message }, { status: 500 });
  }
}
