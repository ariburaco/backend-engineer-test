import { type FastifyInstance } from 'fastify';
import { blockSchema } from '../schemas/models';
import { validateBody } from '../utils/validators';
import blockService from '../services/block-service';

async function blockRoutes(fastify: FastifyInstance) {
  // POST /blocks
  fastify.post('/blocks', async (request, reply) => {
    const { success, data: blockData } = await validateBody(
      blockSchema,
      request,
      reply
    );

    if (!success || !blockData) {
      return;
    }

    try {
      const result = await blockService.processBlock(blockData);
      reply.status(201).send(result);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  });
}

export default blockRoutes;
