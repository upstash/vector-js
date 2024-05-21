import { afterAll, describe, expect, test } from "bun:test";
import { QueryCommand, UpsertCommand } from "@commands/index";
import { awaitUntilIndexed, newHttpClient, range, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("QUERY", () => {
  afterAll(async () => await resetIndexes());
  test("should query records successfully", async () => {
    const initialVector = range(0, 384);
    const initialData = { id: 33, vector: initialVector };
    await new UpsertCommand(initialData).exec(client);

    await awaitUntilIndexed(client);

    const res = await new QueryCommand<{ hello: "World" }>({
      includeVectors: true,
      vector: initialVector,
      topK: 1,
    }).exec(client);

    expect(res).toEqual([
      {
        id: "33",
        score: 1,
        vector: initialVector,
      },
    ]);
  });
  test("should query records filtered with metadata filter", async () => {
    const initialVector = range(0, 384);
    const initialData = {
      id: 34,
      vector: initialVector,
      metadata: {
        city: "Istanbul",
        population: 1546000,
        geography: {
          continent: "Asia",
        },
      },
    };
    await new UpsertCommand(initialData).exec(client);

    await awaitUntilIndexed(client);

    const res = await new QueryCommand<{
      city: string;
      population: number;
      geography: { continent: string };
    }>({
      vector: initialVector,
      topK: 1,
      filter: "population > 1000000 AND geography.continent = 'Asia'",
      includeVectors: true,
      includeMetadata: true,
    }).exec(client);
    expect(res).toEqual([
      {
        id: "34",
        score: 1,
        vector: initialVector,
        metadata: {
          city: "Istanbul",
          population: 1546000,
          geography: { continent: "Asia" },
        },
      },
    ]);
  });
  test("should narrow down the query results with filter", async () => {
    const initialVector = range(0, 384);
    const initialData = [
      {
        id: 1,
        vector: initialVector,
        metadata: {
          animal: "elephant",
          tags: ["mammal"],
          diet: "herbivore",
        },
      },
      {
        id: 2,
        vector: initialVector,
        metadata: {
          animal: "tiger",
          tags: ["mammal"],
          diet: "carnivore",
        },
      },
    ];
    await new UpsertCommand(initialData).exec(client);

    await awaitUntilIndexed(client);

    const res = await new QueryCommand<{
      animal: string;
      tags: string[];
      diet: string;
    }>({
      vector: initialVector,
      topK: 1,
      filter: "tags[0] = 'mammal' AND diet = 'carnivore'",
      includeVectors: true,
      includeMetadata: true,
    }).exec(client);
    expect(res).toEqual([
      {
        id: "2",
        score: 1,
        vector: initialVector,
        metadata: { animal: "tiger", tags: ["mammal"], diet: "carnivore" },
      },
    ]);
  });

  test(
    "should query with plain text successfully",
    async () => {
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
      ]).exec(embeddingClient);

      await awaitUntilIndexed(embeddingClient);

      const res = await new QueryCommand({
        data: "Test1-2-3-4-5",
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
      }).exec(embeddingClient);

      expect(res[0].metadata).toEqual({ upstash: "test" });
    },
    { timeout: 20000 }
  );

  test(
    "should upsert bulk data",
    async () => {
      const embeddingClient = newHttpClient(undefined, {
        token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
        url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
      });

      await new UpsertCommand([
        {
          id: "hello-world",
          data: "Test1-2-3-4-5",
          metadata: { upstash: "Cookie" },
        },
        {
          id: "hello-world1",
          data: "Test1-2-3-4-5-6",
          metadata: { upstash: "Monster" },
        },
      ]).exec(embeddingClient);

      await awaitUntilIndexed(embeddingClient);

      const res = await new QueryCommand({
        data: "Test1-2-3-4-5",
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
      }).exec(embeddingClient);

      expect(res[0].metadata).toEqual({ upstash: "Cookie" });
    },
    { timeout: 20000 }
  );
});
