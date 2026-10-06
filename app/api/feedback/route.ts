import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

// POST /api/feedback — any authenticated user can submit
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'You must be logged in to submit feedback.' }, { status: 401 });
    }

    const { projectId, projectTitle, rating, message } = await req.json();

    if (!projectId || !projectTitle || !rating || !message) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    await dbConnect();

    const feedback = await Feedback.create({
      projectId,
      projectTitle,
      userName: session.user.name ?? '',
      userEmail: session.user.email ?? '',
      rating,
      message,
    });

    return NextResponse.json({ message: 'Feedback submitted successfully. Thank you!' }, { status: 201 });
  } catch (error) {
    console.error('Feedback submit error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/feedback — ADMIN ONLY: retrieve all feedback
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Access denied. Admins only.' }, { status: 403 });
    }

    await dbConnect();

    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
