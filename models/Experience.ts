import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  company: string;
  period?: string;
  bullets: string[];
  order: number;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    period: { type: String, default: '' },
    bullets: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Experience: Model<IExperience> =
  mongoose.models.Experience ||
  mongoose.model<IExperience>('Experience', ExperienceSchema);

export default Experience;
