import { afterAll, describe, expect, test } from "bun:test";
import { QueryCommand, UpsertCommand } from "@commands/index";
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

describe("UPSERT", () => {
  afterAll(async () => await resetIndexes());

  test("should add record successfully", async () => {
    const res = await new UpsertCommand({ id: 1, vector: range(0, 384) }).exec(client);
    expect(res).toEqual("Success");
  });

  test("should return an error when vector is missing", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const throwable = async () => {
      await new UpsertCommand({ id: 1 }).exec(client);
    };
    expect(throwable).toThrow();
  });

  test("should add data successfully with a metadata", async () => {
    const res = await new UpsertCommand({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test" },
    }).exec(client);
    expect(res).toEqual("Success");
  });

  test("should add bulk data with string id", async () => {
    const res = await new UpsertCommand([
      {
        id: "hello-world",
        vector: range(0, 384),
        metadata: { upstash: "test" },
      },
      {
        id: "hello-world-4",
        vector: range(0, 384),
        metadata: { upstash: "test" },
      },
    ]).exec(client);
    expect(res).toEqual("Success");
  });

  test("should add plain text as data successfully", async () => {
    const res = await new UpsertCommand([
      {
        id: "hello-world",
        data: "Test1-2-3-4-5",
        metadata: { upstash: "test" },
      },
    ]).exec(client);
    expect(res).toEqual("Success");
  });

  test("should fail to upsert due to mixed usage of vector and plain text", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const throwable = async () => {
      await new UpsertCommand([
        {
          id: "hello-world",

          data: "Test1-2-3-4-5",
          metadata: { upstash: "test" },
        },
        {
          id: "hello-world",
          //@ts-expect-error Mixed usage of vector and data in the same upsert command is not allowed.
          vector: [1, 2, 3, 4],
          metadata: { upstash: "test" },
        },
      ]).exec(client);
    };

    expect(throwable).toThrow();
  });
});

describe("UPSERT with Index Client", () => {
  const index = new Index({
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.UPSTASH_VECTOR_REST_URL!,
  });
  afterAll(async () => await resetIndexes());

  test("should add record successfully", async () => {
    const res = await index.upsert({ id: 1, vector: range(0, 384) });
    expect(res).toEqual("Success");
  });

  test("should return an error when vector is missing", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const throwable = async () => {
      await new UpsertCommand({ id: 1 }).exec(client);
    };
    expect(throwable).toThrow();
  });

  test("should add data successfully with a metadata", async () => {
    const res = await new UpsertCommand({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test" },
    }).exec(client);
    expect(res).toEqual("Success");
  });

  test("should run with index.upsert in bulk", async () => {
    const upsertData = [
      {
        id: randomID(),
        vector: range(0, 384),
        metadata: { upstash: "test-simple-1" },
      },
      {
        id: randomID(),
        vector: range(0, 384),
        metadata: { upstash: "test-simple-2" },
      },
    ];
    const resUpsert = await index.upsert(upsertData, {
      namespace: "test-namespace",
    });

    expect(resUpsert).toEqual("Success");
  });

  test("should add plain text as data successfully", async () => {
    const res = await index.upsert([
      {
        id: "hello-world",
        data: "Test1-2-3-4-5",
        metadata: { upstash: "test" },
      },
    ]);
    expect(res).toEqual("Success");
  });

  test("should fail to upsert due to mixed usage of vector and plain text", () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const throwable = async () => {
      await index.upsert([
        {
          id: "hello-world",

          data: "Test1-2-3-4-5",
          metadata: { upstash: "test" },
        },
        {
          id: "hello-world",
          //@ts-expect-error Mixed usage of vector and data in the same upsert command is not allowed.
          vector: [1, 2, 3, 4],
          metadata: { upstash: "test" },
        },
      ]);
    };

    expect(throwable).toThrow();
  });
});

describe("Upsert with new data field", () => {
  afterAll(async () => await resetIndexes());

  const sparseIndex = new Index({
    token: process.env.SPARSE_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.SPARSE_UPSTASH_VECTOR_REST_URL!,
  });
  const hybridIndex = new Index({
    token: process.env.HYBRID_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.HYBRID_UPSTASH_VECTOR_REST_URL!,
  });

  test("should add data to data field - /upsert-data", async () => {
    const id = randomID();
    const data = "testing data";

    await new UpsertCommand({
      id,
      data,
      metadata: { hello: "world" },
    }).exec(client);
    await awaitUntilIndexed(client);

    const result = await new QueryCommand<{ hello: "world" }>({
      data,
      includeMetadata: true,
      includeVectors: false,
      includeData: true,
      topK: 1,
    }).exec(client);

    expect(result).toEqual([
      {
        id,
        data,
        metadata: { hello: "world" },
        score: 1,
      },
    ]);
  });

  test("should add data to data field - /upsert", async () => {
    const id = randomID();
    const data = "testing data";
    await new UpsertCommand({
      id,
      vector: range(0, 384),
      data,
      metadata: { hello: "world" },
    }).exec(client);
    await awaitUntilIndexed(client);

    const result = await new QueryCommand<{ hello: "world" }>({
      vector: range(0, 384),
      includeMetadata: true,
      includeVectors: false,
      includeData: true,
      topK: 1,
    }).exec(client);

    expect(result.map((r) => r.data)).toEqual([data]);
  });

  test("should upsert to sparse", async () => {
    const namespace = "upsert-sparse";

    // populate will upsert vectors
    const mockData = await populateSparseIndex(sparseIndex, namespace);

    const result = await sparseIndex.fetch(mockData.map((vector) => vector.id) as string[], {
      includeVectors: true,
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
        sparseVector: {
          indices: [1, 2],
          values: [0.2, 0.3],
        },
      },
      {
        id: "id2",
        sparseVector: {
          indices: [2, 3],
          values: [0.3, 0.4],
        },
      },
    ]);
  });

  test("should upsert to hybrid", async () => {
    const namespace = "upsert-hybrid";

    // populate will upsert vectors
    const mockData = await populateHybridIndex(hybridIndex, namespace);

    const result = await hybridIndex.fetch(mockData.map((vector) => vector.id) as string[], {
      includeVectors: true,
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
        vector: [0.2, 0.3],
        sparseVector: {
          indices: [1, 2],
          values: [0.2, 0.3],
        },
      },
      {
        id: "id2",
        vector: [0.3, 0.4],
        sparseVector: {
          indices: [2, 3],
          values: [0.3, 0.4],
        },
      },
    ]);
  });
});
