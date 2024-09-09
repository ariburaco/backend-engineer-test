import type { FastifyInstance } from 'fastify';
import rollbackService from '../services/rollback-service';
import { validateQueryString } from '../utils/validators';
import { z } from 'zod';

const rollbackQuerySchema = z.object({
  height: z.string().min(1),
});

async function rollbackRoutes(fastify: FastifyInstance) {
  // POST /rollback?height=number
  fastify.post('/rollback', async (request, reply) => {
    const { success, data } = await validateQueryString(
      rollbackQuerySchema,
      request,
      reply
    );

    if (!success || !data?.height) {
      return;
    }

    const height = parseInt(data.height);

    if (isNaN(height)) {
      return reply.status(400).send({ error: 'Invalid height' });
    }

    try {
      const result = await rollbackService.rollbackToHeight(height);
      reply.send(result);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  });
}

export default rollbackRoutes;
