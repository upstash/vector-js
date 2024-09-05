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

  test("should paginate records successfully", async () => {
    const randomizedData = Array.from({ length: 20 })
      .fill("")
      .map(() => ({ id: randomID(), data: "Test data" }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);

    await awaitUntilIndexed(client);

    const res = await new RangeCommand({
      cursor: 0,
      limit: 5,
      includeData: true,
    }).exec(client);
    expect(res.vectors[0].data).toEqual("Test data");
  });
});

describe("RANGE with Index Client", () => {
  const index = new Index({
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.UPSTASH_VECTOR_REST_URL!,
  });

  afterAll(async () => {
    await index.reset();
  });
  test("should paginate records successfully", async () => {
    const randomizedData = Array.from({ length: 20 })
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
