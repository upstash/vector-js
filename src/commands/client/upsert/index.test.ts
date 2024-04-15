import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("UPSERT", () => {
  afterAll(async () => await resetIndexes());

  test("should add record successfully", async () => {
    const res = await new UpsertCommand({ id: 1, vector: [0.1, 0.2] }).exec(client);
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
      vector: [0.1, 0.2],
      metadata: { upstash: "test" },
    }).exec(client);
    expect(res).toEqual("Success");
  });

  test("should add bulk data with string id", async () => {
    const res = await new UpsertCommand([
      {
        id: "hello-world",
        vector: [0.1, 0.2],
        metadata: { upstash: "test" },
      },
      {
        id: "hello-world-4",
        vector: [3, 4],
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
          //@ts-ignore
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
