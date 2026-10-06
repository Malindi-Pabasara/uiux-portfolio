import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    await dbConnect();

    // Find the user or admin
    let account = (await User.findOne({ email })) as any;
    if (!account) {
      account = (await Admin.findOne({ email })) as any;
    }

    if (!account) {
      return NextResponse.json({ error: 'Invalid email or OTP' }, { status: 400 });
    }

    // Verify OTP
    if (account.resetOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Verify expiry
    if (!account.resetOtpExpiry || account.resetOtpExpiry < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP fields
    account.password = hashedPassword;
    account.resetOtp = undefined;
    account.resetOtpExpiry = undefined;
    
    await account.save();

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
