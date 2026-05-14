import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  role: 'citizen' | 'officer';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password, optional if we support other providers later
    role: { type: String, enum: ['citizen', 'officer'], default: 'citizen' },
  },
  { timestamps: true }
);

// Prevent re-compilation of model in development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
