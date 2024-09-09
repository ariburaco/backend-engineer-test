import crypto from "crypto";
import type { Block, BlockWithoutId, Transaction } from "../schemas/models";
import { prisma } from "../db";

export class BlockService {
  async processBlock(blockData: BlockWithoutId) {
    const { height, transactions } = blockData;

    const lastBlock = await prisma.block.findFirst({
      orderBy: { height: "desc" },
    });

    if (lastBlock && lastBlock.height + 1 !== height) {
      throw new Error(
        `Invalid block height. Expected: ${lastBlock.height + 1}`
      );
    }

    if (!lastBlock && height !== 1) {
      throw new Error(`The first block must have height 1.`);
    }

    await this.validateTransactionSum(transactions, height);

    const calculatedBlockId = this.calculateBlockId(
      height,
      transactions.map((tx: any) => tx.id)
    );

    // TODO: I think generating the block ID make more sense here,
    // instead of getting from the client (API request).

    // if (calculatedBlockId !== id) {
    //   throw new Error(
    //     `Block ID is invalid. Expected: ${calculatedBlockId}, received: ${id}`
    //   );
    // }

    await prisma.block.create({
      data: {
        id: calculatedBlockId,
        height,
        transactions: {
          create: transactions.map((tx: any) => ({
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

    return { message: "Block processed successfully" };
  }

  private async validateTransactionSum(
    transactions: Transaction[],
    height: number
  ) {
    for (const tx of transactions) {
      let inputSum = 0;

      if (height !== 1) {
        if (tx.inputs.length > 0) {
          inputSum = await this.calculateInputSum(tx.inputs);
        } else {
          throw new Error(
            `Non-genesis block transaction ${tx.id} has no inputs`
          );
        }
      }

      const outputSum = tx.outputs.reduce(
        (sum: number, output: any) => sum + output.value,
        0
      );

      if (height !== 1 && inputSum !== outputSum) {
        throw new Error(
          `Input sum ${inputSum} does not match output sum ${outputSum} for transaction ${tx.id}`
        );
      }
    }
  }

  private async calculateInputSum(inputs: any[]) {
    let total = 0;

    for (const input of inputs) {
      const transaction = await prisma.transaction.findUnique({
        where: { id: input.txId },
        include: { outputs: true },
      });

      if (!transaction) {
        throw new Error(
          `Referenced transaction not found for txId (${input.txId})`
        );
      }

      const output = transaction.outputs[input.index];

      if (!output) {
        throw new Error(
          `Referenced output not found for txId (${input.txId}), index (${input.index})`
        );
      }

      const spentInput = await prisma.input.findFirst({
        where: {
          txId: input.txId,
          index: input.index,
        },
      });

      if (spentInput) {
        throw new Error(
          `Output (txId: ${input.txId}, index: ${input.index}) has already been spent`
        );
      }

      total += output.value;
    }

    return total;
  }

  private calculateBlockId(height: number, transactionIds: string[]): string {
    const inputString = `${height}${transactionIds.join("")}`;
    return crypto.createHash("sha256").update(inputString).digest("hex");
  }

  public static calculateBlockIdFromBlockData(blockData: Omit<Block, "id">) {
    const { height, transactions } = blockData;
    const transactionIds = transactions.map((tx: any) => tx.id);
    const inputString = `${height}${transactionIds.join("")}`;
    return crypto.createHash("sha256").update(inputString).digest("hex");
  }

  public static getBlocks = async () => {
    const blocks = await prisma.block.findMany({
      include: { transactions: { include: { inputs: true, outputs: true } } },
    });
    return blocks;
  };

  public static validateCalculatedBlockId = async (blockData: Block) => {
    const calculatedBlockId =
      BlockService.calculateBlockIdFromBlockData(blockData);
    const block = await prisma.block.findFirst({
      where: { id: calculatedBlockId },
    });

    if (!block) {
      throw new Error(
        `Block ID is invalid. Expected: ${calculatedBlockId}, received: ${blockData.id}`
      );
    }

    return true;
  };
}

export default new BlockService();
