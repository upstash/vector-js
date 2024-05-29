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

describe("UPDATE with Index Client", () => {
  const index = new Index({
    token: process.env.EMBEDDING_UPSTASH_VECTOR_REST_TOKEN!,
    url: process.env.EMBEDDING_UPSTASH_VECTOR_REST_URL!,
  });
  afterAll(async () => await resetIndexes());

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
