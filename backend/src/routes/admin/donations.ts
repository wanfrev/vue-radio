import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../plugins/auth.js';
import { DonationAccountSchema } from '../../schemas/donations.js';
import { donationsRepo } from '../../repos/donations.js';

const CreateBodySchema = DonationAccountSchema.omit({ id: true });
const UpdateBodySchema = DonationAccountSchema.omit({ id: true }).partial();

export async function adminDonationsRoutes(app: FastifyInstance): Promise<void> {
  // All routes in this plugin require authentication
  app.addHook('onRequest', requireAuth);

  app.get('/', async () => {
    const accounts = await donationsRepo.findAll();
    return { accounts };
  });

  app.post('/', async (req, reply) => {
    const parsed = CreateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const account = await donationsRepo.create(parsed.data);
    return reply.code(201).send(account);
  });

  app.put('/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (Number.isNaN(id)) {
      return reply.code(400).send({ error: 'Invalid id' });
    }
    const parsed = UpdateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }
    const account = await donationsRepo.update(id, parsed.data);
    if (!account) {
      return reply.code(404).send({ error: 'Account not found' });
    }
    return account;
  });

  app.delete('/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (Number.isNaN(id)) {
      return reply.code(400).send({ error: 'Invalid id' });
    }
    const ok = await donationsRepo.softDelete(id);
    if (!ok) {
      return reply.code(404).send({ error: 'Account not found' });
    }
    return { ok: true };
  });
}
