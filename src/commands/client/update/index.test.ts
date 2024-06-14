import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpdateCommand, UpsertCommand } from "@commands/index";
import { Index, awaitUntilIndexed, newHttpClient, range, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("UPDATE", () => {
  afterAll(async () => await resetIndexes());

  test("should update vector metadata", async () => {
    await new UpsertCommand({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test-simple" },
    }).exec(client);

    const res = await new UpdateCommand({
      id: 1,
      metadata: { upstash: "test-update" },
    }).exec(client);

    expect(res).toEqual({ updated: 1 });

    await awaitUntilIndexed(client, 5000);

    const fetchData = await new FetchCommand<{ upstash: string }>([
      ["1"],
      { includeMetadata: true },
    ]).exec(client);

    expect(fetchData[0]?.metadata?.upstash).toBe("test-update");
  });
});

test("should update vector data", async () => {
  await new UpsertCommand({
    id: 1,
    data: "hello",
    metadata: { upstash: "test-simple" },
  }).exec(client);
  await awaitUntilIndexed(client, 5000);

  const res = await new FetchCommand([
    [1],
    {
      includeData: true,
    },
  ]).exec(client);

  expect(res.length).toEqual(1);
  expect(res[0]?.data).toEqual("hello");

  const updated = await new UpdateCommand({ id: "1", data: "there" }).exec(client);
  expect(updated).toEqual({ updated: 1 });
  await awaitUntilIndexed(client, 5000);

  const newRes = await new FetchCommand([
    [1],
    {
      includeData: true,
      includeMetadata: true,
    },
  ]).exec(client);

  expect(newRes.length).toEqual(1);
  expect(newRes[0]?.data).toEqual("there");
  expect(newRes[0]?.metadata).toEqual({ upstash: "test-simple" });
});

describe("UPDATE with Index Client", () => {
  const index = new Index({
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.UPSTASH_VECTOR_REST_URL!,
  });
  afterAll(async () => {
    await index.reset();
  });

  test("should update vector metadata", async () => {
    await index.upsert({
      id: 1,
      vector: range(0, 384),
      metadata: { upstash: "test-simple" },
    });

    await awaitUntilIndexed(index);

    const res = await index.update({
      id: 1,
      metadata: { upstash: "test-update" },
    });

    expect(res).toEqual({ updated: 1 });

    await awaitUntilIndexed(client, 5000);

    const fetchData = await index.fetch(["1"], { includeMetadata: true });

    expect(fetchData[0]?.metadata?.upstash).toBe("test-update");
  });
});
