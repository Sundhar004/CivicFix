import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IIssue extends Document {
  title: string;
  description: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  status: 'open' | 'claimed' | 'fixed';
  fixedImageUrl?: string;
  createdBy: IUser['_id'];
  claimedBy?: IUser['_id'];
  resolutionComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    imageUrl: { type: String },
    status: { type: String, enum: ['open', 'claimed', 'fixed'], default: 'open' },
    fixedImageUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    claimedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionComment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
