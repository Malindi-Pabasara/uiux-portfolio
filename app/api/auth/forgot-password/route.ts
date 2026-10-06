import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Admin from '@/models/Admin';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if the user is a regular user or an admin
    let account = (await User.findOne({ email })) as any;
    let role = 'user';

    if (!account) {
      account = (await Admin.findOne({ email })) as any;
      if (account) role = 'admin';
    }

    if (!account) {
      // Return 200 even if not found to prevent email enumeration attacks
      return NextResponse.json({ message: 'If an account with that email exists, we sent an OTP.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save to DB
    account.resetOtp = otp;
    account.resetOtpExpiry = otpExpiry;
    await account.save();

    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your specific email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
      html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It is valid for 15 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'If an account with that email exists, we sent an OTP.' });
  } catch (error) {
    console.error('Error in forgot-password API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
