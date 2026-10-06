import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Education from '@/models/Education';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const items = await Education.find().sort({ order: 1 }).lean();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await req.json();
    const item = await Education.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
  }
}
