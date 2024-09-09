import { prisma } from "../src/db";
import type { BlockWithoutId } from "../src/schemas/models";
import { BlockService } from "../src/services/block-service";

const testBlocksWithoutIds: BlockWithoutId[] = [
  {
    height: 1,
    transactions: [
      {
        id: "tx1",
        inputs: [], // Coinbase-like transaction
        outputs: [
          {
            address: "addr1", // addr1 gets 10 units
            value: 10,
          },
        ],
      },
    ],
  },
  {
    height: 2,
    transactions: [
      {
        id: "tx2",
        inputs: [
          {
            txId: "tx1", // addr1 spends 10 units, remaining 0
            index: 0,
          },
        ],
        outputs: [
          {
            address: "addr2", // addr2 gets 4 units
            value: 4,
          },
          {
            address: "addr3", // addr3 gets 6 units
            value: 6,
          },
        ],
      },
    ],
  },
  {
    height: 3,
    transactions: [
      {
        id: "tx3",
        inputs: [
          {
            txId: "tx2", // addr2 spends 4 units, remaining 0
            index: 1,
          },
        ],
        outputs: [
          {
            address: "addr4", // addr4 gets 2 units
            value: 2,
          },
          {
            address: "addr5", // addr5 gets 2 units
            value: 2,
          },
          {
            address: "addr6", // addr6 gets 2 units
            value: 2,
          },
        ],
      },
    ],
  },
];

export async function seedTest() {
  // Clear existing data
  await prisma.input.deleteMany();
  await prisma.output.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.block.deleteMany();

  // Seed some blocks and transactions, (No block ID is provided, so it will be calculated)
  // transcations are not validated, while seeding the data. But the test data is valid.
  for (const block of testBlocksWithoutIds) {
    const blockData = {
      ...block,
      id: BlockService.calculateBlockIdFromBlockData(block),
    };

    await prisma.block.create({
      data: {
        id: blockData.id,
        height: blockData.height,
        transactions: {
          create: blockData.transactions.map((tx: any) => ({
            id: tx.id,
            inputs: {
              create: tx.inputs.map((input: any) => ({
                txId: input.txId,
                index: input.index,
              })),
            },
            outputs: {
              create: tx.outputs.map((output: any) => ({
                address: output.address,
                value: output.value,
              })),
            },
          })),
        },
      },
    });
  }
}
