import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISkill extends Document {
  category: string;
  items: string[];
  order: number;
  portfolioType: 'Full-Stack' | 'UI/UX';
}

const SkillSchema = new Schema<ISkill>(
  {
    category: { type: String, required: true },
    items: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    portfolioType: { type: String, enum: ['Full-Stack', 'UI/UX'], default: 'Full-Stack' },
  },
  { timestamps: true }
);

const Skill: Model<ISkill> =
  mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);

export default Skill;
