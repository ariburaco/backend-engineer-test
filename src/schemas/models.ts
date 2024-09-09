import { z } from 'zod';

export const outputSchema = z.object({
  address: z.string(),
  value: z.number(),
});

export const inputSchema = z.object({
  txId: z.string(),
  index: z.number(),
});

export const transactionSchema = z.object({
  id: z.string(),
  inputs: z.array(inputSchema),
  outputs: z.array(outputSchema),
});

export const blockSchema = z.object({
  id: z.string(),
  height: z.number(),
  transactions: z.array(transactionSchema),
});

export type Output = z.infer<typeof outputSchema>;
export type Input = z.infer<typeof inputSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Block = z.infer<typeof blockSchema>;
export type BlockWithoutId = Omit<Block, "id">;
