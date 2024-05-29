import { afterAll, describe, expect, test } from "bun:test";
import { RangeCommand, UpsertCommand } from "@commands/index";
import {
  Index,
  awaitUntilIndexed,
  newHttpClient,
  randomID,
  range,
  resetIndexes,
} from "@utils/test-utils";

const client = newHttpClient();

describe("RANGE", () => {
  afterAll(async () => await resetIndexes());

  test("should query records successfully", async () => {
    const randomizedData = new Array(20)
      .fill("")
      .map(() => ({ id: randomID(), vector: range(0, 384) }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);

    await awaitUntilIndexed(client);

    const res = await new RangeCommand({
      cursor: 0,
      limit: 5,
      includeVectors: true,
    }).exec(client);
    expect(res.nextCursor).toBe("5");
  });
});

describe("RANGE with Index Client", () => {
  const index = new Index({
    token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
  });

  afterAll(async () => await resetIndexes());
  test("should query records successfully", async () => {
    const randomizedData = new Array(20)
      .fill("")
      .map(() => ({ id: randomID(), vector: range(0, 384) }));

    await index.upsert(randomizedData);

    await awaitUntilIndexed(index);

    const res = await index.range({
      cursor: 0,
      limit: 5,
      includeVectors: true,
    });

    expect(res.nextCursor).toBe("5");
  });
});
