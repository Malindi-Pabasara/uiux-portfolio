import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, any> = { ...body };
    if (body.portfolioType !== undefined) {
      updateData.portfolioType = body.portfolioType === 'UI/UX' ? 'UI/UX' : 'Full-Stack';
    }

    const skill = await Skill.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(skill);
  } catch (err: any) {
    console.error('Error updating skill:', err);
    return NextResponse.json({ error: 'Failed to update skill', detail: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { id } = await params;
    await Skill.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
