import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  password: string; // bcrypt hashed
  email?: string;
  resetOtp?: string;
  resetOtpExpiry?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true, trim: true, lowercase: true },
    resetOtp: { type: String, required: false },
    resetOtpExpiry: { type: Date, required: false },
  },
  { timestamps: true }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
