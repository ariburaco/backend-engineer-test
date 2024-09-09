import { describe, it, expect, beforeAll, afterEach } from "bun:test";
import { seedTest } from "../prisma/seed-test";
import rollbackService from "../src/services/rollback-service";
import { prisma } from "../src/db";
import balanceService from "../src/services/balance-service";

describe("Rollback Service (Integration)", () => {
  beforeAll(async () => {
    await seedTest();
  });

  afterEach(async () => {
    await seedTest();
  });

  it("should rollback to a specific height", async () => {
    const initialHeight = 3;
    const rollbackHeight = 2;

    // Check initial state
    const initialBlock = await prisma.block.findFirst({
      orderBy: { height: "desc" },
    });
    expect(initialBlock?.height).toBe(initialHeight);

    // Perform rollback
    await rollbackService.rollbackToHeight(rollbackHeight);

    // Check state after rollback
    const afterRollbackBlock = await prisma.block.findFirst({
      orderBy: { height: "desc" },
    });
    expect(afterRollbackBlock?.height).toBe(rollbackHeight);
  });

  it("should update balances correctly after rollback", async () => {
    const rollbackHeight = 2;

    // Perform rollback
    await rollbackService.rollbackToHeight(rollbackHeight);

    // Check balances after rollback
    const { balance: addr1Balance } = await balanceService.getBalance("addr1");
    const { balance: addr2Balance } = await balanceService.getBalance("addr2");
    const { balance: addr3Balance } = await balanceService.getBalance("addr3");

    expect(addr1Balance).toBe(0);
    expect(addr2Balance).toBe(4);
    expect(addr3Balance).toBe(6);

    try {
      await balanceService.getBalance("addr4");
      throw new Error(
        "Expected balanceService.getBalance to throw, but it didn't"
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Address not found");
    }

    try {
      await balanceService.getBalance("addr5");
      throw new Error(
        "Expected balanceService.getBalance to throw, but it didn't"
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Address not found");
    }

    try {
      await balanceService.getBalance("addr6");
      throw new Error(
        "Expected balanceService.getBalance to throw, but it didn't"
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Address not found");
    }
  });

  it("should compare the balances after rollback", async () => {
    const rollbackHeight = 2;

    // Get initial balances
    const initialBalances = await Promise.all([
      balanceService.getBalance("addr1"),
      balanceService.getBalance("addr2"),
      balanceService.getBalance("addr3"),
      balanceService.getBalance("addr4"),
      balanceService.getBalance("addr5"),
      balanceService.getBalance("addr6"),
    ]);

    // Perform rollback
    await rollbackService.rollbackToHeight(rollbackHeight);

    // Get balances after rollback
    const { balance: addr1Balance } = await balanceService.getBalance("addr1");
    const { balance: addr2Balance } = await balanceService.getBalance("addr2");
    const { balance: addr3Balance } = await balanceService.getBalance("addr3");

    expect(addr1Balance).toBe(0);
    expect(addr2Balance).toBe(4);
    expect(addr3Balance).toBe(6);

    try {
      await balanceService.getBalance("addr4");
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Address not found");
    }

    try {
      await balanceService.getBalance("addr5");
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Address not found");
    }

    try {
      await balanceService.getBalance("addr6");
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Address not found");
    }
  });

  it("should throw an error when trying to rollback to a non-existent height", async () => {
    const nonExistentHeight = 10;
    const currentHeight = await rollbackService.getCurrentHeight();
    try {
      await rollbackService.rollbackToHeight(nonExistentHeight);
      throw new Error("Expected rollbackToHeight to throw, but it didn't");
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        `Cannot rollback to a height (${nonExistentHeight}) greater than the current height (${currentHeight})`
      );
    }
  });

  it("should rollback to height 1 (initial state)", async () => {
    const rollbackHeight = 1;

    await rollbackService.rollbackToHeight(rollbackHeight);

    const { balance: addr1Balance } = await balanceService.getBalance("addr1");
    expect(addr1Balance).toBe(10);

    // Check that other addresses don't exist
    for (const addr of ["addr2", "addr3", "addr4", "addr5", "addr6"]) {
      try {
        await balanceService.getBalance(addr);
        throw new Error(`Expected address ${addr} to not exist`);
      } catch (error: any) {
        expect(error.message).toBe("Address not found");
      }
    }
  });

  it("should not change state when rolling back to current height", async () => {
    const currentHeight = 3;
    const initialBalances = await Promise.all([
      balanceService.getBalance("addr1"),
      balanceService.getBalance("addr2"),
      balanceService.getBalance("addr3"),
      balanceService.getBalance("addr4"),
      balanceService.getBalance("addr5"),
      balanceService.getBalance("addr6"),
    ]);

    const result = await rollbackService.rollbackToHeight(currentHeight);
    expect(result.message).toBe(
      `Already at height ${currentHeight}, no rollback needed`
    );

    const finalBalances = await Promise.all([
      balanceService.getBalance("addr1"),
      balanceService.getBalance("addr2"),
      balanceService.getBalance("addr3"),
      balanceService.getBalance("addr4"),
      balanceService.getBalance("addr5"),
      balanceService.getBalance("addr6"),
    ]);

    expect(finalBalances).toEqual(initialBalances);
  });
});
