import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEducation extends Document {
  degree: string;
  institution: string;
  period: string;
  details: string;
  active: boolean;
  order: number;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    period: { type: String, required: true },
    details: { type: String, default: '' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Education: Model<IEducation> =
  mongoose.models.Education ||
  mongoose.model<IEducation>('Education', EducationSchema);

export default Education;
