import { z } from 'zod';

export const DonationAccountSchema = z.object({
  id: z.number().int().positive(),
  bankName: z.string().min(1).max(120),
  accountHolder: z.string().min(1).max(200),
  clabe: z.string().regex(/^\d{18}$/, 'CLABE debe tener 18 dígitos'),
  accountNumber: z.string().min(1).max(50),
  accountType: z.enum(['ahorro', 'cheques']).default('ahorro'),
  notes: z.string().max(500).default(''),
  sortOrder: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});

export type DonationAccount = z.infer<typeof DonationAccountSchema>;

export const DonationListResponseSchema = z.object({
  accounts: z.array(DonationAccountSchema),
});
