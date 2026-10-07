import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  tags: string[];
  caseStudyUrl: string;
  prototypeUrl: string;
  order: number;
  imageUrl: string;
  category: 'fullstack' | 'uiux';
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },
    caseStudyUrl: { type: String, default: '#' },
    prototypeUrl: { type: String, default: '#' },
    order: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    category: { type: String, enum: ['fullstack', 'uiux'], default: 'fullstack' },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
