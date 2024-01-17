import { afterAll, describe, expect, test } from "bun:test";
import { UpsertCommand } from "@commands/index";
import { newHttpClient, randomFloat, randomID, resetIndexes } from "@utils/test-utils";
import { sleep } from "bun";
import { StatsCommand } from ".";

const client = newHttpClient();

describe("STATS", () => {
  afterAll(async () => await resetIndexes());

  test("should return vectorCount successfully", async () => {
    const vectorCount = 20;
    const randomizedData = new Array(vectorCount).fill("").map(() => ({
      id: randomID(),
      vector: [randomFloat(), randomFloat()],
    }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);
    await sleep(2000);
    const res = await new StatsCommand().exec(client);
    expect(res.vectorCount).toBeGreaterThanOrEqual(vectorCount);
  });
});
