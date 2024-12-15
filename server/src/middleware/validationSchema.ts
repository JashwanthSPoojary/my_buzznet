import { z } from "zod";

const signupSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be 3-20 characters' })
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Only letters, numbers, underscores' }),
  
  email: z.string().email({ message: 'Invalid email address' }),

  password: z.string()
    .min(6, { message: 'Password must be 6-20 characters' })
    .max(20)
    .regex(/[A-Z]/, { message: 'At least one uppercase letter' })
    .regex(/[a-z]/, { message: 'At least one lowercase letter' })
    .regex(/[0-9]/, { message: 'At least one number' }),
});

const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),

  password: z.string()
    .min(6, { message: 'Password must be 6-20 characters' })
    .max(20)
    .regex(/[A-Z]/, { message: 'At least one uppercase letter' })
    .regex(/[a-z]/, { message: 'At least one lowercase letter' })
    .regex(/[0-9]/, { message: 'At least one number' }),
});

const createModalSchema = z.object({
    name: z.string().min(3).max(50),
});

const messageSchema = z.object({
  content: z.string().min(1).max(1000),
});

export {
    signupSchema,
    signinSchema,
    createModalSchema,
    messageSchema
}