import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpsertCommand } from "@commands/index";
import { Index, newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("UPSERT", () => {
  afterAll(async () => await resetIndexes());

  test("should add record successfully", async () => {
    const res = await new UpsertCommand({ id: 1, vector: range(0, 384) }).exec(client);
    expect(res).toEqual("Success");
  });

  // biome-ignore lint/nursery/useAwait: required to test bad payloads
  test("should return an error when vector is missing", async () => {
    const throwable = async () => {
      //@ts-ignore
      await new UpsertCommand({ id: 1 }).exec(client);
    };
    expect(throwable).toThrow();
  });

  test("should add data successfully with a metadata", async () => {
    //@ts-ignore
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
    const embeddingClient = newHttpClient(undefined, {
      token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
      url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
    });

    const res = await new UpsertCommand([
      {
        id: "hello-world",
        data: "Test1-2-3-4-5",
        metadata: { upstash: "test" },
      },
    ]).exec(embeddingClient);
    expect(res).toEqual("Success");
  });

  test("should fail to upsert due to mixed usage of vector and plain text", () => {
    const throwable = async () => {
      const embeddingClient = newHttpClient(undefined, {
        token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
        url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
      });

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
      ]).exec(embeddingClient);
    };

    expect(throwable).toThrow();
  });

  test("should add data as metadata, when no metadata is provided", async () => {
    const embeddingClient = newHttpClient(undefined, {
      token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
      url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
    });
    const resUpsert = await new UpsertCommand({
      id: "hello-world",
      data: "testing data",
    }).exec(embeddingClient);

    const resFetch = await new FetchCommand([
      ["hello-world"],
      {
        includeMetadata: true,
      },
    ]).exec(embeddingClient);

    expect(resFetch[0]?.metadata).toEqual({ data: "testing data" });

    expect(resUpsert).toEqual("Success");
  });
});

describe("UPSERT with Index Client", () => {
  const index = new Index({
    token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
  });
  afterAll(async () => await resetIndexes());

  test("should add record successfully", async () => {
    const res = await index.upsert({ id: 1, vector: range(0, 384) });
    expect(res).toEqual("Success");
  });

  // biome-ignore lint/nursery/useAwait: required to test bad payloads
  test("should return an error when vector is missing", async () => {
    const throwable = async () => {
      //@ts-ignore
      await new UpsertCommand({ id: 1 }).exec(client);
    };
    expect(throwable).toThrow();
  });

  test("should add data successfully with a metadata", async () => {
    //@ts-ignore
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
    const resUpsert = await index.upsert(upsertData, { namespace: "test-namespace" });

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
