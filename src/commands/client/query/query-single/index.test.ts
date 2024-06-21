import { afterAll, describe, expect, test } from "bun:test";
import { QueryCommand, UpsertCommand } from "@commands/index";
import { Index, awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";

const client = newHttpClient();

describe("QUERY", () => {
  const index = new Index();

  afterAll(async () => {
    await index.reset();
  });
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
      await new UpsertCommand([
        {
          id: "hello-world",
          data: "testing-plan-text",
          metadata: { upstash: "test" },
        },
      ]).exec(client);

      await awaitUntilIndexed(client);

      const res = await new QueryCommand({
        data: "testing-plain-text",
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
      }).exec(client);

      expect(res[0].metadata).toEqual({ upstash: "test" });
    },
    { timeout: 20000 }
  );

  test(
    "should upsert bulk data",
    async () => {
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
      ]).exec(client);

      await awaitUntilIndexed(client);

      const res = await new QueryCommand({
        data: "testing-bulk-data-original",
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
      }).exec(client);

      expect(res[0].metadata).toEqual({ upstash: "Cookie" });
    },
    { timeout: 20000 }
  );

  test("should return data field when includeData enabled", async () => {
    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      data: "Shakuhachi",
    };

    await index.upsert(mockData);

    await awaitUntilIndexed(index);

    const result = await index.query({
      includeMetadata: false,
      vector: mockData.vector,
      includeData: true,
      includeVectors: false,
      topK: 1,
    });

    const { vector: _vector, ...rest } = mockData;

    expect(result).toEqual([{ ...rest, score: 1 }]);
  });

  test("should not return data field when includeData disabled", async () => {
    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      data: "Shakuhachi",
    };

    await index.upsert(mockData);

    await awaitUntilIndexed(index);

    const result = await index.query({
      includeMetadata: false,
      vector: mockData.vector,
      includeData: false,
      includeVectors: false,
      topK: 1,
    });
    const { data: _data, vector: _vector, ...rest } = mockData;
    expect(result).toEqual([{ ...rest, score: 1 }]);
  });
});

describe("QUERY with Index Client", () => {
  const index = new Index();

  afterAll(async () => {
    await index.reset();
  });

  test("should query records successfully", async () => {
    const ID = randomID();
    const initialVector = range(0, 384);
    const initialData = { id: ID, vector: initialVector };
    await index.upsert(initialData);

    await awaitUntilIndexed(index);

    const res = await index.query<{ hello: "World" }>({
      vector: initialVector,
      includeVectors: true,
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
      await index.upsert([
        {
          id: "hello-world",
          data: "with-index-plain-text-query-test",
          metadata: { upstash: "test" },
        },
      ]);

      await awaitUntilIndexed(index);

      const res = await index.query({
        data: "with-index-plain-text-query-test",
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
