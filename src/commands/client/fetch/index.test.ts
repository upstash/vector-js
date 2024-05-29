import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpsertCommand } from "@commands/index";
import { awaitUntilIndexed, newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";
import { Index } from "../../../../index";

const client = newHttpClient();

describe("FETCH", () => {
  afterAll(async () => await resetIndexes());

  test("should fetch records successfully", async () => {
    const randomizedData = new Array(20)
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
});

describe("FETCH with Index Client", () => {
  const index = new Index({
    token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
  });

  test("should fetch array of records by IDs succesfully", async () => {
    const randomizedData = new Array(20)
      .fill("")
      .map(() => ({ id: randomID(), vector: range(0, 384) }));

    await index.upsert(randomizedData);

    await awaitUntilIndexed(index);

    const IDs = randomizedData.map((x) => x.id);
    const res = await index.fetch(IDs, { includeVectors: true });

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
});
