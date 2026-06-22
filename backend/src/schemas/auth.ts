import { z } from 'zod';

export const LoginBodySchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;
