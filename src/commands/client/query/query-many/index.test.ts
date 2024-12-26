import { afterAll, describe, expect, mock, test } from "bun:test";
import { UpsertCommand } from "@commands/client/upsert";
import {
  Index,
  awaitUntilIndexed,
  newHttpClient,
  populateHybridIndex,
  randomID,
  range,
} from "@utils/test-utils";
import { QueryManyCommand } from ".";
import { FusionAlgorithm, WeightingStrategy } from "../types";

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
  const hybridIndex = new Index({
    token: process.env.HYBRID_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.HYBRID_UPSTASH_VECTOR_REST_URL!,
  });

  afterAll(async () => {
    await index.reset();
    await hybridIndex.reset({ all: true });
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

  test("should query hybrid index", async () => {
    const namespace = "query-hybrid";
    const mockData = await populateHybridIndex(hybridIndex, namespace);

    const result = await index.queryMany(
      [
        {
          topK: 1,
          vector: [0.1, 0.1],
          sparseVector: [
            [3, 4],
            [0.1, 0.2],
          ],
          fusionAlgorithm: FusionAlgorithm.RRF,
        },
        {
          topK: 1,
          vector: [0.5, 0.1],
          sparseVector: [
            [0, 1],
            [0.5, 0.1],
          ],
          includeVectors: true,
        },
        {
          topK: 1,
          sparseVector: [
            [2, 3],
            [0.5, 0.5],
          ],
          weightingStrategy: WeightingStrategy.IDF,
          fusionAlgorithm: FusionAlgorithm.DBSF,
          includeMetadata: true,
        },
      ],
      {
        namespace,
      }
    );

    // @ts-expect-error will fix after testing with actual index
    expect(result).toEqual("todo: fix with actual");
  });
});
