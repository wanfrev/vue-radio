import type { FastifyInstance } from 'fastify';
import { donationsRepo } from '../repos/donations.js';

export async function donationsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * Public: list active donation accounts ordered by sort_order.
   */
  fastify.get('/donations', async () => {
    const accounts = await donationsRepo.findActive();
    return { accounts };
  });
}
