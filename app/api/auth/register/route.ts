import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Emails that automatically receive the 'admin' role
const ADMIN_EMAILS = ['malindi.wpm@gmail.com', 'nchathuranga533@gmail.com'];

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    // Prevent duplicate accounts
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists. Please log in.' }, { status: 400 });
    }

    // Assign role based on email
    const role = ADMIN_EMAILS.includes(normalizedEmail) ? 'admin' : 'user';

    // Hash password and save
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      { message: role === 'admin' ? 'Admin account created successfully.' : 'Account created successfully. Welcome!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
