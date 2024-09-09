import { prisma } from "../db";

class BalanceService {
  async getBalance(address: string) {
    const isAddressValid = await this.isAddressExists(address);
    if (!isAddressValid) {
      throw new Error("Address not found");
    }

    const received = await prisma.output.aggregate({
      _sum: {
        value: true,
      },
      where: {
        address,
      },
    });

    const receivedOutputs = await prisma.output.findMany({
      where: {
        address,
      },
      select: {
        transactionId: true,
        id: true,
      },
    });

    const spentValues = await Promise.all(
      receivedOutputs.map(async (output) => {
        const input = await prisma.input.findFirst({
          where: {
            txId: output.transactionId,
            index: 0,
          },
        });

        if (input) {
          const referencedOutput = await prisma.output.findFirst({
            where: {
              transactionId: input.txId,
            },
            orderBy: {
              id: "asc",
            },
            skip: input.index,
            take: 1,
          });

          return referencedOutput?.value || 0;
        }

        return 0;
      })
    );

    const spentValue = spentValues.reduce((sum, value) => sum + value, 0);

    const balance = (received._sum.value || 0) - spentValue;

    return { balance };
  }

  private async isAddressExists(address: string) {
    const isAddressExists = await prisma.output.findFirst({
      where: { address },
    });
    return !!isAddressExists;
  }
}

export default new BalanceService();
