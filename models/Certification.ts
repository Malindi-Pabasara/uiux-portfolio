import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertification extends Document {
  title: string;
  issuer: string;
  year: string;
  order: number;
}

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    year: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Certification: Model<ICertification> =
  mongoose.models.Certification ||
  mongoose.model<ICertification>('Certification', CertificationSchema);

export default Certification;
