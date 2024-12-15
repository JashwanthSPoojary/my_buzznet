"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = exports.createModalSchema = exports.signinSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const signupSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, { message: 'Username must be 3-20 characters' })
        .max(20)
        .regex(/^[a-zA-Z0-9_]+$/, { message: 'Only letters, numbers, underscores' }),
    email: zod_1.z.string().email({ message: 'Invalid email address' }),
    password: zod_1.z.string()
        .min(6, { message: 'Password must be 6-20 characters' })
        .max(20)
        .regex(/[A-Z]/, { message: 'At least one uppercase letter' })
        .regex(/[a-z]/, { message: 'At least one lowercase letter' })
        .regex(/[0-9]/, { message: 'At least one number' }),
});
exports.signupSchema = signupSchema;
const signinSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Invalid email address' }),
    password: zod_1.z.string()
        .min(6, { message: 'Password must be 6-20 characters' })
        .max(20)
        .regex(/[A-Z]/, { message: 'At least one uppercase letter' })
        .regex(/[a-z]/, { message: 'At least one lowercase letter' })
        .regex(/[0-9]/, { message: 'At least one number' }),
});
exports.signinSchema = signinSchema;
const createModalSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(50),
});
exports.createModalSchema = createModalSchema;
const messageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000),
});
exports.messageSchema = messageSchema;
