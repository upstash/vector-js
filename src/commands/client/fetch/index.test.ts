import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";
import { sleep } from "bun";
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

  test("should fetch succesfully by index.fetch", async () => {
    const index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    const randomFetch = await index.fetch([randomID()], {
      includeMetadata: true,
      namespace: "test",
    });

    expect(randomFetch).toEqual([null]);

    const mockData = {
      id: randomID(),
      vector: range(0, 384),
      metadata: { hello: "world" },
    };

    await index.upsert(mockData, { namespace: "test" });

    sleep(4000);

    const fetchWithID = await index.fetch([mockData.id], {
      includeMetadata: true,
      includeVectors: true,
      namespace: "test",
    });

    expect(fetchWithID).toEqual([mockData]);
  });
});
