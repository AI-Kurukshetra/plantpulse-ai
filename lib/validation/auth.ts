import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid work email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email('Enter a valid work email address.'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Confirm your password.'),
    role: z.enum(['plant_manager', 'technician'])
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export type SignupValues = z.infer<typeof signupSchema>;

export const createUserSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['admin', 'plant_manager', 'technician'])
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
