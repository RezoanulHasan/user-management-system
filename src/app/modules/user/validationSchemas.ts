import { z } from 'zod';

export const UserSchema = z.object({
  username: z.string().min(1).max(255),
  role: z.string(),
  phone: z.number(),
  gender: z.string().optional(),
  userImage: z.string().optional(),
  password: z.string().min(1),
  email: z.string().min(1),
});
