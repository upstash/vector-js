import { afterAll, describe, expect, test } from "bun:test";
import { UpsertCommand } from "@commands/index";
import { newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";
import { sleep } from "bun";
import { InfoCommand } from ".";

const client = newHttpClient();

describe("INFO", () => {
  afterAll(async () => await resetIndexes());

  test("should return vectorCount successfully", async () => {
    const vectorCount = 20;
    const randomizedData = new Array(vectorCount).fill("").map(() => ({
      id: randomID(),
      vector: range(0, 384),
    }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);
    await sleep(2000);
    const res = await new InfoCommand().exec(client);
    expect(res.vectorCount).toBeGreaterThanOrEqual(vectorCount);
  });
});
