import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  projectId: string;
  projectTitle: string;
  userName: string;
  userEmail: string;
  rating: number;
  message: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    projectId: { type: String, required: true },
    projectTitle: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
