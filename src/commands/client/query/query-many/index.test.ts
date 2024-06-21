import { afterAll, describe, expect, test } from "bun:test";
import { UpsertCommand } from "@commands/client/upsert";
import { Index, awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";
import { QueryManyCommand } from ".";

const client = newHttpClient();

describe("QUERY", () => {
  const index = new Index();

  afterAll(async () => {
    await index.reset();
  });
  test("should query in batches successfully", async () => {
    const ID = randomID();
    const initialData = [
      {
        id: `1-${ID}`,
        vector: range(0, 384),
        metadata: {
          animal: "elephant",
          tags: ["mammal"],
          diet: "herbivore",
        },
      },
      {
        id: `2-${ID}`,
        vector: range(0, 384),
        metadata: {
          animal: "tiger",
          tags: ["mammal"],
          diet: "carnivore",
        },
      },
    ];
    await new UpsertCommand(initialData).exec(client);

    await awaitUntilIndexed(client);

    const res = await new QueryManyCommand<{
      animal: string;
      tags: string[];
      diet: string;
    }>([
      {
        vector: initialData[0].vector,
        topK: 1,
        filter: "tags[0] = 'mammal' AND diet = 'herbivore'",
        includeMetadata: true,
      },
      {
        vector: initialData[1].vector,
        topK: 1,
        filter: "tags[0] = 'mammal' AND diet = 'carnivore'",
        includeMetadata: true,
      },
    ]).exec(client);

    expect(res).toEqual([
      [
        {
          id: `1-${ID}`,
          score: 1,
          metadata: { animal: "elephant", tags: ["mammal"], diet: "herbivore" },
        },
      ],
      [
        {
          id: `2-${ID}`,
          score: 1,
          metadata: { animal: "tiger", tags: ["mammal"], diet: "carnivore" },
        },
      ],
    ]);
  });
});

describe("QUERY with Index Client", () => {
  const index = new Index();

  afterAll(async () => {
    await index.reset();
  });
  test("should query in batches successfully", async () => {
    const ID = randomID();
    const initialData = [
      {
        id: `1-${ID}`,
        vector: range(0, 384),
        metadata: {
          animal: "elephant",
          tags: ["mammal"],
          diet: "herbivore",
        },
      },
      {
        id: `2-${ID}`,
        vector: range(0, 384),
        metadata: {
          animal: "tiger",
          tags: ["mammal"],
          diet: "carnivore",
        },
      },
    ];

    await index.upsert(initialData);

    await awaitUntilIndexed(index);

    const res = await index.queryMany<{
      animal: string;
      tags: string[];
      diet: string;
    }>([
      {
        vector: initialData[0].vector,
        topK: 1,
        filter: "tags[0] = 'mammal' AND diet = 'herbivore'",
        includeMetadata: true,
      },
      {
        vector: initialData[1].vector,
        topK: 1,
        filter: "tags[0] = 'mammal' AND diet = 'carnivore'",
        includeMetadata: true,
      },
    ]);

    expect(res).toEqual([
      [
        {
          id: `1-${ID}`,
          score: 1,
          metadata: { animal: "elephant", tags: ["mammal"], diet: "herbivore" },
        },
      ],
      [
        {
          id: `2-${ID}`,
          score: 1,
          metadata: { animal: "tiger", tags: ["mammal"], diet: "carnivore" },
        },
      ],
    ]);
  });
});
