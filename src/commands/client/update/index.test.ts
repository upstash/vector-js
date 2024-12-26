import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpdateCommand, UpsertCommand } from "@commands/index";
import {
  Index,
  awaitUntilIndexed,
  newHttpClient,
  populateHybridIndex,
  populateSparseIndex,
  range,
  resetIndexes,
} from "@utils/test-utils";

const client = newHttpClient();

describe("UPDATE", () => {
  afterAll(async () => await resetIndexes());

  test("should update vector metadata", async () => {
    await new UpsertCommand({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test-simple" },
    }).exec(client);

    const res = await new UpdateCommand({
      id: 1,
      metadata: { upstash: "test-update" },
    }).exec(client);
    await awaitUntilIndexed(client, 5000);

    expect(res).toEqual({ updated: 1 });

    const fetchData = await new FetchCommand<{ upstash: string }>([
      ["1"],
      { includeMetadata: true },
    ]).exec(client);

    expect(fetchData[0]?.metadata?.upstash).toBe("test-update");
  });

  test("should update vector metadata value without overriding initial", async () => {
    await new UpsertCommand({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test-simple", upstashRocks: "rocks" },
    }).exec(client);

    const res = await new UpdateCommand({
      id: 1,
      metadataUpdateMode: "PATCH",
      metadata: { upstash: "test-update" },
    }).exec(client);
    await awaitUntilIndexed(client, 5000);

    expect(res).toEqual({ updated: 1 });

    const fetchData = await new FetchCommand<{ upstash: string }>([
      ["1"],
      { includeMetadata: true },
    ]).exec(client);

    expect(fetchData[0]?.metadata?.upstash).toBe("test-update");
  });

  test("should update vector data", async () => {
    await new UpsertCommand({
      id: 1,
      data: "hello",
      metadata: { upstash: "test-simple" },
    }).exec(client);

    const res = await new FetchCommand([
      [1],
      {
        includeData: true,
      },
    ]).exec(client);

    expect(res.length).toEqual(1);
    expect(res[0]?.data).toEqual("hello");

    const updated = await new UpdateCommand({ id: "1", data: "there" }).exec(client);
    await awaitUntilIndexed(client, 5000);

    expect(updated).toEqual({ updated: 1 });

    const newRes = await new FetchCommand([
      [1],
      {
        includeData: true,
        includeMetadata: true,
      },
    ]).exec(client);

    expect(newRes.length).toEqual(1);
    expect(newRes[0]?.data).toEqual("there");
    expect(newRes[0]?.metadata).toEqual({ upstash: "test-simple" });
  });
});

describe("UPDATE with Index Client", () => {
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
    await resetIndexes();
  });

  test("should update vector metadata", async () => {
    await index.upsert({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test-simple" },
    });

    const res = await index.update({
      id: 1,
      metadata: { upstash: "test-update" },
    });
    await awaitUntilIndexed(client, 5000);

    expect(res).toEqual({ updated: 1 });

    const fetchData = await index.fetch(["1"], { includeMetadata: true });

    expect(fetchData[0]?.metadata?.upstash).toBe("test-update");
  });

  test("should add new field to metadata without overriding everything", async () => {
    await index.upsert({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test-simple" },
    });

    const res = await index.update({
      id: 1,
      metadataUpdateMode: "PATCH",
      metadata: { upstashRocks: "test-update" },
    });
    await awaitUntilIndexed(index);

    expect(res).toEqual({ updated: 1 });

    const fetchData = await index.fetch(["1"], { includeMetadata: true });

    expect(fetchData[0]?.metadata?.upstashRocks).toBe("test-update");
  });

  test("should update sparse index", async () => {
    const namespace = "update-sparse";
    await populateSparseIndex(sparseIndex, namespace);

    const { updated } = await sparseIndex.update(
      {
        id: "id1",
        sparseVector: [
          [6, 7],
          [0.5, 0.6],
        ],
      },
      {
        namespace,
      }
    );

    expect(updated).toBe(1);

    const res = await sparseIndex.fetch(["id1"], {
      includeVectors: true,
      namespace,
    });

    // Assert fetch results
    expect(res.length).toBe(1);
    expect(res[0]).not.toBeNull();
    const vector = res[0]!;
    expect(vector.id).toBe("id1");
    expect(vector.sparseVector).toEqual([
      [6, 7],
      [0.5, 0.6],
    ]);
  });

  test("should update hybrid index", async () => {
    const namespace = "update-hybrid";
    await populateHybridIndex(hybridIndex, namespace);

    const { updated } = await hybridIndex.update(
      {
        id: "id1",
        vector: [0.5, 0.6],
        sparseVector: [
          [6, 7],
          [0.5, 0.6],
        ],
      },
      {
        namespace,
      }
    );

    expect(updated).toBe(1);

    const res = await sparseIndex.fetch(["id1"], {
      includeVectors: true,
      namespace,
    });

    // Assert fetch results
    expect(res.length).toBe(1);
    expect(res[0]).not.toBeNull();
    const vector = res[0]!;
    expect(vector.id).toBe("id1");
    expect(vector.vector).toEqual([0.5, 0.6]);
    expect(vector.sparseVector).toEqual([
      [6, 7],
      [0.5, 0.6],
    ]);
  });
});
