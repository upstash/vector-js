import { afterAll, describe, expect, test } from "bun:test";
import { RangeCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, randomFloat, randomID, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("RANGE", () => {
  afterAll(async () => await resetIndexes());

  test("should query records successfully", async () => {
    const randomizedData = new Array(20)
      .fill("")
      .map(() => ({ id: randomID(), vector: [randomFloat(), randomFloat()] }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);

    const res = await new RangeCommand({
      cursor: 0,
      limit: 5,
      includeVectors: true,
    }).exec(client);
    expect(res.nextCursor).toBe("5");
  });
});
