import { z } from 'zod';

export const DonationAccountSchema = z.object({
  id: z.number().int().positive(),
  bankName: z.string().min(1).max(120),
  accountHolder: z.string().max(200).default(''),
  clabe: z.string().max(100).default(''),
  accountNumber: z.string().max(50).default(''),
  accountType: z.enum(['ahorro', 'cheques']).default('ahorro'),
  notes: z.string().max(500).default(''),
  sortOrder: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});

export type DonationAccount = z.infer<typeof DonationAccountSchema>;

export const DonationListResponseSchema = z.object({
  accounts: z.array(DonationAccountSchema),
});
