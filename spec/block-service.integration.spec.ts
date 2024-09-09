import { afterAll, describe, expect, it, beforeEach } from "bun:test";
import { prisma } from "../src/db";
import type { Block } from "../src/schemas/models";
import blockService, { BlockService } from "../src/services/block-service";

describe("Block Service (Integration)", () => {
  beforeEach(async () => {
    await prisma.input.deleteMany();
    await prisma.output.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.block.deleteMany();
  });

  // afterAll(async () => {
  //   await prisma.input.deleteMany();
  //   await prisma.output.deleteMany();
  //   await prisma.transaction.deleteMany();
  //   await prisma.block.deleteMany();
  // });

  it("should validate block id for all blocks", async () => {
    const blocks = await BlockService.getBlocks();

    let results: boolean[] = [];
    for (const block of blocks) {
      results.push(await BlockService.validateCalculatedBlockId(block));
    }
    expect(results).toEqual(blocks.map(() => true));
  });

  describe("processBlock", async () => {
    it("should process a basic valid block successfully", async () => {
      // Create a valid block
      const validBlock: Omit<Block, "id"> = {
        height: 1,
        transactions: [
          {
            id: "tx1",
            inputs: [],
            outputs: [{ address: "address1", value: 50 }],
          },
        ],
      };

      const result = await blockService.processBlock(validBlock);
      expect(result).toEqual({ message: "Block processed successfully" });
    });

    it("should process a block with multiple transactions successfully", async () => {
      const blocks: Omit<Block, "id">[] = [
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

      const firstBlockResult = await blockService.processBlock(blocks[0]);
      expect(firstBlockResult).toEqual({
        message: "Block processed successfully",
      });

      const secondBlockResult = await blockService.processBlock(blocks[1]);
      expect(secondBlockResult).toEqual({
        message: "Block processed successfully",
      });

      const thirdBlockResult = await blockService.processBlock(blocks[2]);
      expect(thirdBlockResult).toEqual({
        message: "Block processed successfully",
      });
    });
  });
});
