import { afterAll, describe, expect, test } from "bun:test";
import { QueryCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, resetIndexes } from "@utils/test-utils";
import { sleep } from "bun";

const client = newHttpClient();

describe("QUERY", () => {
  afterAll(async () => await resetIndexes());

  test("should query records successfully", async () => {
    const initialVector = [6.6, 7.7];
    const initialData = { id: 33, vector: initialVector };

    await new UpsertCommand(initialData).exec(client);
    //This is needed for vector index insertion to happen. When run with other tests in parallel this tends to fail without sleep. But, standalone it should work without an issue.
    await sleep(2000);
    const res = await new QueryCommand<{ hello: "World" }>({
      includeVectors: true,
      vector: initialVector,
      topK: 1,
    }).exec(client);
    expect(res).toEqual([
      {
        id: "33",
        score: 1,
        vector: [6.6, 7.7],
      },
    ]);
  });

  test("should query records filtered with metadata filter", async () => {
    const initialVector = [6.6, 7.7];
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
    //This is needed for vector index insertion to happen. When run with other tests in parallel this tends to fail without sleep. But, standalone it should work without an issue.
    await sleep(2000);
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
        vector: [6.6, 7.7],
        metadata: { city: "Istanbul", population: 1546000, geography: { continent: "Asia" } },
      },
    ]);
  });

  test("should narrow down the query results with filter", async () => {
    const exampleVector = [6.6, 7.7];
    const initialData = [
      {
        id: 1,
        vector: exampleVector,
        metadata: {
          animal: "elephant",
          tags: ["mammal"],
          diet: "herbivore",
        },
      },
      {
        id: 2,
        vector: exampleVector,
        metadata: {
          animal: "tiger",
          tags: ["mammal"],
          diet: "carnivore",
        },
      },
    ];

    await new UpsertCommand(initialData).exec(client);
    //This is needed for vector index insertion to happen. When run with other tests in parallel this tends to fail without sleep. But, standalone it should work without an issue.
    await sleep(2000);
    const res = await new QueryCommand<{ animal: string; tags: string[]; diet: string }>({
      vector: exampleVector,
      topK: 1,
      filter: "tags[0] = 'mammal' AND diet = 'carnivore'",
      includeVectors: true,
      includeMetadata: true,
    }).exec(client);

    expect(res).toEqual([
      {
        id: "2",
        score: 1,
        vector: [6.6, 7.7],
        metadata: { animal: "tiger", tags: ["mammal"], diet: "carnivore" },
      },
    ]);
  });
});
