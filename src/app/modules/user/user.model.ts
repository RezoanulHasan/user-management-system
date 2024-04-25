import mongoose, { Schema, Document } from 'mongoose';
import { UserSchema as ValidationUserSchema } from './validationSchemas';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  role: 'superAdmin' | 'user' | 'admin';
  passwordChangeHistory: { password: string; timestamp: Date }[];
  userImage?: string;
  gender: 'male' | 'female';
  phoneNumber: string;
  address?: string;
  age?: number;
  country?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userImage: { type: String },

    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
    },

    gender: { type: String, enum: ['male', 'female'], required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String },
    age: { type: Number },
    country: { type: String },
    passwordChangeHistory: [
      {
        password: { type: String, required: true },
        timestamp: { type: Date, required: true },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateUser = (data: Record<string, any>) =>
  ValidationUserSchema.parse(data);
