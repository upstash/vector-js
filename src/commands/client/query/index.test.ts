import { afterAll, describe, expect, test } from "bun:test";
import { QueryCommand, UpsertCommand } from "@commands/index";
import { awaitUntilIndexed, newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";
import { Index } from "@utils/test-utils";

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
          data: "testing-plan-text",
          metadata: { upstash: "test" },
        },
      ]).exec(embeddingClient);

      await awaitUntilIndexed(embeddingClient);

      const res = await new QueryCommand({
        data: "testing-plain-text",
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
          data: "testing-bulk-data-original",
          metadata: { upstash: "Cookie" },
        },
        {
          id: "hello-world1",
          data: "testing-bulk-data-secondary",
          metadata: { upstash: "Monster" },
        },
      ]).exec(embeddingClient);

      await awaitUntilIndexed(embeddingClient);

      const res = await new QueryCommand({
        data: "testing-bulk-data-original",
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
      }).exec(embeddingClient);

      expect(res[0].metadata).toEqual({ upstash: "Cookie" });
    },
    { timeout: 20000 }
  );
});

describe("QUERY with Index Client", () => {
  const index = new Index({
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.UPSTASH_VECTOR_REST_URL!,
  });

  const embeddingIndex = new Index({
    token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
  });

  afterAll(async () => await resetIndexes());

  test("should query records successfully", async () => {
    const ID = randomID();
    const initialVector = range(0, 384);
    const initialData = { id: ID, vector: initialVector };
    await index.upsert(initialData);

    await awaitUntilIndexed(index);

    const res = await index.query<{ hello: "World" }>({
      includeVectors: true,
      vector: initialVector,
      topK: 1,
    });

    expect(res).toEqual([
      {
        id: ID,
        score: 1,
        vector: initialVector,
      },
    ]);
  });

  test(
    "should query with plain text successfully",
    async () => {
      embeddingIndex.upsert([
        {
          id: "hello-world",
          data: "testing-plan-text",
          metadata: { upstash: "test" },
        },
      ]);

      await awaitUntilIndexed(embeddingIndex);

      const res = await embeddingIndex.query({
        data: "testing-plain-text",
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
      });

      expect(res[0].metadata).toEqual({ upstash: "test" });
    },
    { timeout: 20000 }
  );

  test("should narrow down the query results with filter", async () => {
    const ID = randomID();
    const initialVector = range(0, 384);
    const initialData = [
      {
        id: `1-${ID}`,
        vector: initialVector,
        metadata: {
          animal: "elephant",
          tags: ["mammal"],
          diet: "herbivore",
        },
      },
      {
        id: `2-${ID}`,
        vector: initialVector,
        metadata: {
          animal: "tiger",
          tags: ["mammal"],
          diet: "carnivore",
        },
      },
    ];

    await index.upsert(initialData);

    await awaitUntilIndexed(index);

    const res = await index.query<{
      animal: string;
      tags: string[];
      diet: string;
    }>({
      vector: initialVector,
      topK: 1,
      filter: "tags[0] = 'mammal' AND diet = 'carnivore'",
      includeVectors: true,
      includeMetadata: true,
    });

    expect(res).toEqual([
      {
        id: `2-${ID}`,
        score: 1,
        vector: initialVector,
        metadata: { animal: "tiger", tags: ["mammal"], diet: "carnivore" },
      },
    ]);
  });
});
