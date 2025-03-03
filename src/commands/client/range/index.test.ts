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

  test("should paginate with prefix using index client", async () => {
    const prefix = `prefix-${Math.floor(Math.random() * 10000)}-`;
    const data = [
      { id: `${prefix}1`, vector: range(0, 384) },
      { id: `${prefix}2`, vector: range(0, 384) },
      { id: `${prefix}3`, vector: range(0, 384) },
      { id: "different_prefix_1", vector: range(0, 384) },
      { id: `${prefix}4`, vector: range(0, 384) },
    ];

    await index.upsert(data);
    await awaitUntilIndexed(index);

    // First page
    const res = await index.range({
      cursor: 0,
      limit: 2,
      includeVectors: true,
      prefix,
    });

    expect(res.vectors.length).toBe(2);
    expect(res.vectors.every((item) => item.id.startsWith(prefix))).toBe(true);

    // Second page with same prefix
    const nextPage = await index.range({
      cursor: res.nextCursor,
      limit: 2,
      includeVectors: true,
      prefix,
    });

    expect(nextPage.vectors.length).toBe(2);
    expect(nextPage.vectors.every((item) => item.id.startsWith(prefix))).toBe(true);
    expect(nextPage.nextCursor).toBe("");
  });

  test("should paginate with prefix in namespace", async () => {
    const prefix = `prefix-${Math.floor(Math.random() * 10000)}-`;
    const namespace = "test_namespace";
    const data = [
      { id: `${prefix}1`, vector: range(0, 384) },
      { id: `${prefix}2`, vector: range(0, 384) },
      { id: `${prefix}3`, vector: range(0, 384) },
      { id: "different_prefix_1", vector: range(0, 384) },
      { id: `${prefix}4`, vector: range(0, 384) },
    ];

    await index.upsert(data, { namespace });
    await awaitUntilIndexed(index);

    // First page with prefix
    const res = await index.range(
      {
        cursor: 0,
        limit: 2,
        includeVectors: true,
        prefix,
      },
      { namespace }
    );

    expect(res.vectors.length).toBe(2);
    expect(res.vectors.every((item) => item.id.startsWith(prefix))).toBe(true);

    // Second page with same prefix
    const nextPage = await index.range(
      {
        cursor: res.nextCursor,
        limit: 2,
        includeVectors: true,
        prefix,
      },
      { namespace }
    );

    expect(nextPage.vectors.length).toBe(2);
    expect(nextPage.vectors.every((item) => item.id.startsWith(prefix))).toBe(true);
    expect(nextPage.nextCursor).toBe("");
  });

  test("should use range for sparse", async () => {
    const namespace = "range-sparse";

    const vectors: ConstructorParameters<typeof UpsertCommand<Dict<unknown>>>[0] = Array.from(
      { length: 20 },
      (_, i) => ({
        id: `id-${i}`,
        sparseVector: {
          indices: [Math.floor(Math.random() * 11), Math.floor(Math.random() * 11)],
          values: [Math.random(), Math.random()],
        },
        metadata: { meta: i },
        data: `data-${i}`,
      })
    );

    await sparseIndex.upsert(vectors, { namespace });
    await awaitUntilIndexed(sparseIndex);

    let res = await sparseIndex.range(
      {
        cursor: "",
        limit: 4,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      },
      {
        namespace,
      }
    );

    // Initial batch assertions
    expect(res.vectors.length).toBe(4);
    expect(res.nextCursor).not.toBe("");

    for (let i = 0; i < 4; i++) {
      const vector = res.vectors[i];
      expect(vector.id).toBe(`id-${i}`);
      expect(vector.metadata).toEqual({ meta: i });
      expect(vector.data).toBe(`data-${i}`);
      expect(vector.sparseVector).not.toBeNull();
    }

    // Paginate through remaining results
    while (res.nextCursor !== "") {
      res = await sparseIndex.range(
        {
          cursor: res.nextCursor,
          limit: 8,
          includeVectors: true,
        },
        { namespace }
      );
      expect(res.vectors.length).toBe(8);
    }
  });

  test("should use range for hybrid", async () => {
    const namespace = "range-hybrid";

    const vectors: ConstructorParameters<typeof UpsertCommand<Dict<unknown>>>[0] = Array.from(
      { length: 20 },
      (_, i) => ({
        id: `id-${i}`,
        vector: [Math.random(), Math.random()],
        sparseVector: {
          indices: [Math.floor(Math.random() * 11), Math.floor(Math.random() * 11)],
          values: [Math.random(), Math.random()],
        },
        metadata: { meta: i },
        data: `data-${i}`,
      })
    );

    await hybridIndex.upsert(vectors, { namespace });
    await awaitUntilIndexed(hybridIndex);

    let res = await hybridIndex.range(
      {
        cursor: "",
        limit: 4,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      },
      {
        namespace,
      }
    );

    // Initial batch assertions
    expect(res.vectors.length).toBe(4);
    expect(res.nextCursor).not.toBe("");

    for (let i = 0; i < 4; i++) {
      const vector = res.vectors[i];
      expect(vector.id).toBe(`id-${i}`);
      expect(vector.metadata).toEqual({ meta: i });
      expect(vector.data).toBe(`data-${i}`);
      expect(vector.sparseVector).not.toBeNull();
      expect(vector.vector).not.toBeNull();
    }

    // Paginate through remaining results
    while (res.nextCursor !== "") {
      res = await hybridIndex.range(
        {
          cursor: res.nextCursor,
          limit: 8,
          includeVectors: true,
        },
        { namespace }
      );
      expect(res.vectors.length).toBe(8);
    }
  });
});
