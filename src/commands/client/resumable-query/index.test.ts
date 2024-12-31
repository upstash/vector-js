import { afterAll, describe, expect, test } from "bun:test";

import {
  Index,
  awaitUntilIndexed,
  populateHybridIndex,
  populateSparseIndex,
  range,
} from "@utils/test-utils";
import { sleep } from "bun";
import { FusionAlgorithm, WeightingStrategy } from "../query/types";

describe("RESUMABLE QUERY", () => {
  const index = new Index();
  const sparseIndex = new Index({
    token: process.env.SPARSE_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.SPARSE_UPSTASH_VECTOR_REST_URL!,
  });
  const hybridIndex = new Index({
    token: process.env.HYBRID_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.HYBRID_UPSTASH_VECTOR_REST_URL!,
  });
  afterAll(async () => {
    await index.reset();
  });
  test("should start query successfully", async () => {
    const { result, stop } = await index.resumableQuery({
      maxIdle: 3600,
      topK: 50,
      vector: range(0, 384),
      includeMetadata: true,
      includeVectors: true,
    });

    expect(result).toBeDefined();

    await stop();
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
    }).toThrow(
      "The resumable query has already been stopped. Please start another resumable query."
    );
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
    { timeout: 10_000 }
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
    { timeout: 10_000 }
  );

  test("should use resumable query for sparse index", async () => {
    // Mock hybrid index object
    const namespace = "resumable-sparse";
    await populateSparseIndex(sparseIndex, namespace);
    // Assertion logic
    const { result, fetchNext, stop } = await sparseIndex.resumableQuery(
      {
        sparseVector: { indices: [0, 1], values: [0.1, 0.2] },
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
        weightingStrategy: WeightingStrategy.IDF,
        fusionAlgorithm: FusionAlgorithm.DBSF,
        maxIdle: 3600,
      },
      {
        namespace,
      }
    );

    expect(result).toEqual([
      {
        id: "id0",
        score: 0.028_608_438,
        sparseVector: {
          indices: [0, 1],
          values: [0.1, 0.2],
        },
      },
    ]);
    const nextResult = await fetchNext(1);
    expect(nextResult).toEqual([
      {
        id: "id1",
        score: 0.018_800_145,
        sparseVector: {
          indices: [1, 2],
          values: [0.2, 0.3],
        },
        metadata: {
          key: "value",
        },
      },
    ]);
    await stop();
  });

  test("should use resumable query for hybrid index", async () => {
    // Mock hybrid index object
    const namespace = "resumable-hybrid";
    await populateHybridIndex(hybridIndex, namespace);
    // Assertion logic
    const { result, fetchNext, stop } = await hybridIndex.resumableQuery(
      {
        vector: [0.1, 0.1],
        sparseVector: { indices: [0], values: [0.1] },
        topK: 2,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
        weightingStrategy: WeightingStrategy.IDF,
        fusionAlgorithm: FusionAlgorithm.DBSF,
        maxIdle: 3600,
      },
      {
        namespace,
      }
    );

    expect(result).toEqual([
      {
        id: "id2",
        score: 0.617_851,
        vector: [0.3, 0.4],
        sparseVector: {
          indices: [2, 3],
          values: [0.3, 0.4],
        },
        metadata: {
          key: "value",
        },
        data: "data",
      },
      {
        id: "id0",
        score: 0.5,
        vector: [0.1, 0.2],
        sparseVector: {
          indices: [0, 1],
          values: [0.1, 0.2],
        },
      },
    ]);
    const nextResult = await fetchNext(1);
    expect(nextResult).toEqual([
      {
        id: "id1",
        score: 0.5,
        vector: [0.2, 0.3],
        sparseVector: {
          indices: [1, 2],
          values: [0.2, 0.3],
        },
        metadata: {
          key: "value",
        },
      },
    ]);
    await stop();
  });
});
