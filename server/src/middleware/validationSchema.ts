import { z } from "zod";

const userSchema = z.object({
    username: z.string()
      .min(3, { message: 'Username must be at least 3 characters long' })
      .max(20, { message: 'Username must be less than 20 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
    
    password: z.string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(20, { message: 'Password must be less than 20 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});
const createModalSchema = z.object({
    name: z.string().min(3).max(50),
});

export {
    userSchema,
    createModalSchema
}