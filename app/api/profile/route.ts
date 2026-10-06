import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const profile = await Profile.findOne().lean();
    return NextResponse.json(profile || {});
  } catch (err) {
    console.error('[profile GET]', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Strip Mongoose/MongoDB internal fields that must not be in the update payload.
    // Sending _id inside $set causes "Mod on _id not allowed" and __v causes conflicts.
    const { _id, __v, createdAt, updatedAt, ...safeBody } = body as Record<string, unknown>;

    // Explicitly build the update object with only the fields we know about.
    // This prevents arbitrary fields from the client overwriting unrelated DB fields.
    const update: Record<string, unknown> = {};

    if (safeBody.name       !== undefined) update.name       = String(safeBody.name ?? '');
    if (safeBody.title      !== undefined) update.title      = String(safeBody.title ?? '');
    if (safeBody.tagline    !== undefined) update.tagline    = String(safeBody.tagline ?? '');
    if (safeBody.bio        !== undefined) update.bio        = String(safeBody.bio ?? '');
    if (safeBody.available  !== undefined) update.available  = Boolean(safeBody.available);
    if (safeBody.stats      !== undefined) update.stats      = safeBody.stats;
    if (safeBody.email      !== undefined) update.email      = String(safeBody.email ?? '');
    if (safeBody.phone      !== undefined) update.phone      = String(safeBody.phone ?? '');
    if (safeBody.linkedin   !== undefined) update.linkedin   = String(safeBody.linkedin ?? '');
    if (safeBody.github     !== undefined) update.github     = String(safeBody.github ?? '');
    if (safeBody.cvUrl      !== undefined) update.cvUrl      = String(safeBody.cvUrl ?? '');
    if (safeBody.avatarUrl  !== undefined) update.avatarUrl  = String(safeBody.avatarUrl ?? '');

    // Use $set so Mongoose patches only the provided fields without replacing the doc.
    // runValidators is intentionally omitted — partial updates should not be forced
    // through full-doc validators (required fields would fail on partial saves).
    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(profile);
  } catch (err) {
    console.error('[profile PUT]', err);
    return NextResponse.json({ error: 'Failed to update profile', detail: String(err) }, { status: 500 });
  }
}
