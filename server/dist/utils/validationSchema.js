"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkspaceSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
const userSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, { message: 'Username must be at least 3 characters long' })
        .max(20, { message: 'Username must be less than 20 characters' })
        .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
    password: zod_1.z.string()
        .min(6, { message: 'Password must be at least 6 characters long' })
        .max(20, { message: 'Password must be less than 20 characters' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});
exports.userSchema = userSchema;
const createWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(50),
});
exports.createWorkspaceSchema = createWorkspaceSchema;
