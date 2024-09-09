import { ZodSchema } from 'zod';
import type { FastifyReply, FastifyRequest } from 'fastify';

type ValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: any;
};

export async function validateBody<T>(
  schema: ZodSchema<T>,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<ValidationResult<T>> {
  const validationResult = schema.safeParse(request.body);

  if (!validationResult.success) {
    reply.status(400).send({ error: validationResult.error.errors });
    return { success: false, error: validationResult.error.errors };
  }

  return { success: true, data: validationResult.data };
}

export async function validateQueryString<T>(
  schema: ZodSchema<T>,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<ValidationResult<T>> {
  const validationResult = schema.safeParse(request.query);

  if (!validationResult.success) {
    reply.status(400).send({ error: validationResult.error.errors });
    return { success: false, error: validationResult.error.errors };
  }

  return { success: true, data: validationResult.data };
}

export async function validateParams<T>(
  schema: ZodSchema<T>,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<ValidationResult<T>> {
  const validationResult = schema.safeParse(request.params);

  if (!validationResult.success) {
    reply.status(400).send({ error: validationResult.error.errors });
    return { success: false, error: validationResult.error.errors };
  }

  return { success: true, data: validationResult.data };
}