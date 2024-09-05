import { afterAll, describe, expect, test } from "bun:test";

import { Index, awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";
import { sleep } from "bun";

describe("RESUMABLE QUERY", () => {
  const index = new Index();
  afterAll(async () => {
    await index.reset();
  });
  test("should start query successfully", async () => {
    const { start } = await index.resumableQuery({
      maxIdle: 3600,
      topK: 50,
      vector: range(0, 384),
      includeMetadata: true,
      includeVectors: true,
    });

    const res = await start();

    expect(res).toBeDefined();
  });
  test("should stop query successfully", async () => {
    const { fetchNext, stop } = await index.resumableQuery({
      maxIdle: 3600,
      topK: 50,
      vector: range(0, 384),
      includeMetadata: true,
      includeVectors: true,
    });

    await sleep(1000);
    const res = await stop();

    expect(res).toBe("Success");

    await expect(async () => {
      await fetchNext(5);
    }).toThrow("Resumable query has not been started. Call start() first.");
  });

  test(
    "should resume query",
    async () => {
      const VECTORS_TO_UPSERT = 4;
      for (let i = 0; i < VECTORS_TO_UPSERT; i++) {
        await index.upsert([
          {
            id: i,
            vector: range(0, 384),
          },
        ]);
      }

      await awaitUntilIndexed(index);

      const { fetchNext, stop, result } = await index.resumableQuery({
        maxIdle: 3600,
        topK: 2,
        vector: range(0, 384),
        includeMetadata: true,
        includeVectors: true,
      });

      expect(result.length).toBe(2);

      const result2 = await fetchNext(1);
      const result3 = await fetchNext(1);

      expect(result2.length).toBe(1);
      expect(result3.length).toBe(1);

      expect(result3).not.toEqual(result2);
      await stop();
    },
    { timeout: 10000 }
  );

  test(
    "should start resumable query with data",
    async () => {
      const VECTORS_TO_UPSERT = 4;
      for (let i = 0; i < VECTORS_TO_UPSERT; i++) {
        await index.upsert([
          {
            id: i,
            vector: range(0, 384),
          },
        ]);
      }

      await awaitUntilIndexed(index);
      const { fetchNext, result, stop } = await index.resumableQuery({
        maxIdle: 3600,
        topK: 2,
        data: "testing it",
        includeMetadata: true,
        includeVectors: true,
      });

      expect(result.length).toBe(2);
      const res = await fetchNext(1);

      expect(res.length).toBe(1);

      await stop();
    },
    { timeout: 10000 }
  );
});
