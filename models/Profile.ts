import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStat {
  label: string;
  value: number;
  suffix?: string;
}

export interface IProfile extends Document {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  available: boolean;
  stats: IStat[];
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  cvUrl: string;
  avatarUrl: string;
}

const StatSchema = new Schema<IStat>({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  suffix: { type: String, default: '' },
});

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    tagline: { type: String, default: '' },
    bio: { type: String, default: '' },
    available: { type: Boolean, default: true },
    stats: { type: [StatSchema], default: [] },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
