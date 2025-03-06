import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpsertCommand } from "@commands/index";
import {
  Index,
  awaitUntilIndexed,
  newHttpClient,
  populateHybridIndex,
  populateSparseIndex,
  randomID,
  range,
  resetIndexes,
} from "@utils/test-utils";

const client = newHttpClient();

describe("FETCH", () => {
  afterAll(async () => await resetIndexes());

  test("should fetch records successfully", async () => {
    const randomizedData = Array.from({ length: 20 })
      .fill("")
      .map(() => ({ id: randomID(), vector: range(0, 384) }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);

    const res = await new FetchCommand([
      randomizedData.map((x) => x.id),
      {
        includeVectors: true,
      },
    ]).exec(client);

    expect(res).toEqual(randomizedData);
  });

  test("should return null when id does not exist", async () => {
    const res = await new FetchCommand([
      [randomID()],
      {
        includeVectors: true,
      },
    ]).exec(client);

    expect(res).toEqual([null]);
  });

  test("should return with metadata", async () => {
    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      metadata: { hello: "world" },
    };
    await new UpsertCommand(mockData).exec(client);

    const res = await new FetchCommand<{ hello: string }>([
      [mockData.id],
      {
        includeVectors: true,
        includeMetadata: true,
      },
    ]).exec(client);

    expect(res).toEqual([mockData]);
  });

  test("should accept id's from object payload", async () => {
    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      metadata: { hello: "world" },
    };
    await new UpsertCommand(mockData).exec(client);

    const res = await new FetchCommand([{ ids: [mockData.id] }]).exec(client);

    expect(res.length).toBe(1);
    expect(res[0]?.id).toBe(mockData.id);
  });

  test("should fetch by prefix", async () => {
    const initialVector = range(0, 384);
    const prefix = `prefix-${Math.floor(Math.random() * 10000)}-`;
    const idsToUpsert = [
      { id: `${prefix}1`, vector: initialVector },
      { id: `${prefix}2`, vector: initialVector },
      { id: `${prefix}3`, vector: initialVector },
      { id: "different_prefix_1", vector: initialVector },
    ];

    await Promise.all(idsToUpsert.map((data) => new UpsertCommand(data).exec(client)));
    await awaitUntilIndexed(client);

    const res = await new FetchCommand([{ prefix }]).exec(client);

    expect(res).toHaveLength(3);
    expect(res.every((item) => item?.id.startsWith(prefix))).toBeTrue();
  });

  test("should throw when multiple fetch criteria are provided", async () => {
    await expect(new FetchCommand([{ ids: ["1"], prefix: "test_" }]).exec(client)).rejects.toThrow(
      "Only one of ids or prefix must be provided."
    );
  });
});

describe("FETCH with Index Client", () => {
  afterAll(async () => await resetIndexes());
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

  test("should fetch array of records by IDs succesfully", async () => {
    const randomizedData = Array.from({ length: 20 })
      .fill("")
      .map(() => ({ id: randomID(), vector: range(0, 384) }));

    await index.upsert(randomizedData);

    await awaitUntilIndexed(index);

    const IDs = randomizedData.map((x) => x.id);
    const res = await index.fetch(IDs, {
      includeVectors: true,
      includeData: true,
    });

    expect(res).toEqual(randomizedData);
  });

  test("should fetch single record by ID", async () => {
    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      metadata: { hello: "world" },
    };

    await index.upsert(mockData, { namespace: "test" });

    await awaitUntilIndexed(index);

    const fetchWithID = await index.fetch([mockData.id], {
      includeMetadata: true,
      includeVectors: true,
      namespace: "test",
    });

    expect(fetchWithID).toEqual([mockData]);
  });

  test("should return null when ID does not exist", async () => {
    const randomFetch = await index.fetch([randomID()], {
      includeMetadata: true,
      namespace: "test",
    });

    expect(randomFetch).toEqual([null]);
  });

  test("should return data field when includeData enabled", async () => {
    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      metadata: { hello: "world" },
      data: "Shakuhachi",
    };

    await index.upsert(mockData);

    await awaitUntilIndexed(index);

    const fetchWithID = await index.fetch([mockData.id], {
      includeMetadata: true,
      includeData: true,
      includeVectors: true,
    });

    expect(fetchWithID).toEqual([mockData]);
  });

  test("should not return data field when includeData disabled", async () => {
    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      metadata: { hello: "world" },
      data: "Shakuhachi",
    };

    await index.upsert(mockData);

    await awaitUntilIndexed(index);

    const fetchWithID = await index.fetch([mockData.id], {
      includeMetadata: true,
      includeVectors: true,
    });
    const { data: _data, ...mockDataWithoutData } = mockData;
    expect(fetchWithID).toEqual([mockDataWithoutData]);
  });

  test("should fetch from sparse", async () => {
    const namespace = "fetch-hybrid";
    await populateSparseIndex(sparseIndex, namespace);

    const result = await sparseIndex.fetch(["id0", "id1", "id2", "id3"], {
      includeVectors: true,
      includeMetadata: true,
      includeData: true,
      namespace,
    });

    expect(result).toEqual([
      {
        id: "id0",
        sparseVector: {
          indices: [0, 1],
          values: [0.1, 0.2],
        },
      },
      {
        id: "id1",
        metadata: { key: "value" },
        sparseVector: {
          indices: [1, 2],
          values: [0.2, 0.3],
        },
      },
      {
        id: "id2",
        metadata: { key: "value" },
        data: "data",
        sparseVector: {
          indices: [2, 3],
          values: [0.3, 0.4],
        },
      },
      null,
    ]);
  });

  test("should fetch from hybrid", async () => {
    const namespace = "fetch-hybrid";
    await populateHybridIndex(hybridIndex, namespace);

    const result = await hybridIndex.fetch(["id0", "id1", "id2", "id3"], {
      includeVectors: true,
      includeMetadata: true,
      includeData: true,
      namespace,
    });

    expect(result).toEqual([
      {
        id: "id0",
        vector: [0.1, 0.2],
        sparseVector: {
          indices: [0, 1],
          values: [0.1, 0.2],
        },
      },
      {
        id: "id1",
        metadata: { key: "value" },
        vector: [0.2, 0.3],
        sparseVector: {
          indices: [1, 2],
          values: [0.2, 0.3],
        },
      },
      {
        id: "id2",
        metadata: { key: "value" },
        data: "data",
        vector: [0.3, 0.4],
        sparseVector: {
          indices: [2, 3],
          values: [0.3, 0.4],
        },
      },
      null,
    ]);
  });

  test("should fetch by prefix using index client", async () => {
    const initialVector = range(0, 384);
    const prefix = `prefix-${Math.floor(Math.random() * 10000)}-`;
    const idsToUpsert = [
      { id: `${prefix}1`, vector: initialVector },
      { id: `${prefix}2`, vector: initialVector },
      { id: `${prefix}3`, vector: initialVector },
      { id: "different_prefix_1", vector: initialVector },
    ];

    await index.upsert(idsToUpsert);
    await awaitUntilIndexed(client);

    const res = await index.fetch({ prefix });
    expect(res).toHaveLength(3);
    expect(res.every((item) => item?.id.startsWith(prefix))).toBeTrue();
  });

  test("should fetch by prefix in namespace", async () => {
    const initialVector = range(0, 384);
    const prefix = `prefix-${Math.floor(Math.random() * 10000)}-`;
    const namespace = "test_namespace";
    const idsToUpsert = [
      { id: `${prefix}1`, vector: initialVector },
      { id: `${prefix}2`, vector: initialVector },
      { id: `${prefix}3`, vector: initialVector },
      { id: "different_prefix_1", vector: initialVector },
    ];

    await index.upsert(idsToUpsert, { namespace });
    await awaitUntilIndexed(client);

    const res = await index.namespace(namespace).fetch({ prefix });

    expect(res).toHaveLength(3);
    expect(res.every((item) => item?.id.startsWith(prefix))).toBeTrue();
  });
});
