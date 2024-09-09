import Fastify from "fastify";
import blockRoutes from "./routes/block-route";
import balanceRoutes from "./routes/balance-route";
import rollbackRoutes from "./routes/rollback-route";

const fastify = Fastify({ logger: true });

fastify.get("/", async (request, reply) => {
  return { message: "Block processor ready" };
});

fastify.register(blockRoutes);
fastify.register(balanceRoutes);
fastify.register(rollbackRoutes);

try {
  await fastify.listen({
    port: 3000,
    host: "0.0.0.0",
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
