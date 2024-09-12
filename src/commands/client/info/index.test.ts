import { afterAll, describe, expect, test } from "bun:test";
import { UpsertCommand } from "@commands/index";
import { awaitUntilIndexed, newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";
import { InfoCommand } from ".";

const client = newHttpClient();

describe("INFO", () => {
  afterAll(async () => await resetIndexes());

  test("should return vectorCount successfully", async () => {
    const vectorCount = 20;
    const randomizedData = Array.from({ length: vectorCount })
      .fill("")
      .map(() => ({
        id: randomID(),
        vector: range(0, 384),
      }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);

    await awaitUntilIndexed(client);

    const res = await new InfoCommand().exec(client);
    expect(res.vectorCount).toBeGreaterThanOrEqual(vectorCount);
  });
});
