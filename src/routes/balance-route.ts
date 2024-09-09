import type { FastifyInstance } from 'fastify';
import balanceService from '../services/balance-service';

async function balanceRoutes(fastify: FastifyInstance) {
  //  GET /balance/:address
  fastify.get('/balance/:address', async (request, reply) => {
    try {
      const params = request.params as unknown as { address: string };
      const address = params?.address;

      if (!address) {
        return reply.status(400).send({ error: 'Address is required' });
      }

      const result = await balanceService.getBalance(address);
      reply.status(200).send(result);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  });
}

export default balanceRoutes;
