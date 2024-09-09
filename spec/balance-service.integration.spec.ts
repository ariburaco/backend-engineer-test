import { describe, it, expect, beforeAll } from "bun:test";
import balanceService from "../src/services/balance-service";
import { seedTest } from "../prisma/seed-test";

describe("BalanceService (Integration)", () => {
  // Seed the database before each test
  beforeAll(async () => {
    await seedTest(); // Seed the database
  });

  it("addr1 should have 0 balance", async () => {
    const result = await balanceService.getBalance("addr1");
    expect(result.balance).toBe(0); // addr1 spent its entire 10 units
  });

  it("addr2 should have 4 balance", async () => {
    const result = await balanceService.getBalance("addr2");
    expect(result.balance).toBe(4); // addr2 received 4 units
  });

  it("addr3 should have 6 balance", async () => {
    const result = await balanceService.getBalance("addr3");
    expect(result.balance).toBe(6); // addr3 received 6 units
  });

  it("addr4 should have 2 balance", async () => {
    const result = await balanceService.getBalance("addr4");
    expect(result.balance).toBe(2); // addr4 received 2 units
  });

  it("addr5 should have 2 balance", async () => {
    const result = await balanceService.getBalance("addr5");
    expect(result.balance).toBe(2); // addr5 received 2 units
  });

  it("addr6 should have 2 balance", async () => {
    const result = await balanceService.getBalance("addr6");
    expect(result.balance).toBe(2); // addr6 received 2 units
  });
});
