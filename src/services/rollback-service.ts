import { prisma } from "../db";

class RollbackService {
  async rollbackToHeight(height: number) {
    const currentHeight = await this.getCurrentHeight();

    if (height > currentHeight) {
      throw new Error(
        `Cannot rollback to a height (${height}) greater than the current height (${currentHeight})`
      );
    }

    if (height === currentHeight) {
      return { message: `Already at height ${height}, no rollback needed` };
    }

    const blocksToRollback = await prisma.block.findMany({
      where: { height: { gt: height } },
      include: { transactions: { include: { inputs: true, outputs: true } } },
    });

    if (blocksToRollback.length === 0) {
      throw new Error(`No blocks found to rollback to height ${height}`);
    }

    // use transaction to delete all related data, if any error happens,
    // all data will be rolled back
    await prisma.$transaction(async (db) => {
      const transactionIds = blocksToRollback.flatMap((block) =>
        block.transactions.map((tx) => tx.id)
      );

      await db.input.deleteMany({
        where: { transactionId: { in: transactionIds } },
      });

      await db.output.deleteMany({
        where: { transactionId: { in: transactionIds } },
      });

      await db.transaction.deleteMany({
        where: { id: { in: transactionIds } },
      });

      await db.block.deleteMany({
        where: { height: { gt: height } },
      });
    });

    return { message: `Rolled back to block height ${height}` };
  }

  public async getCurrentHeight(): Promise<number> {
    const highestBlock = await prisma.block.findFirst({
      orderBy: { height: "desc" },
    });
    return highestBlock?.height ?? 0;
  }
}

export default new RollbackService();
