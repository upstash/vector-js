import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpdateCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, range, resetIndexes } from "@utils/test-utils";
import { sleep } from "bun";
import { Index } from "../../../../index";

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

    sleep(5000);

    const fetchData = await new FetchCommand<{ upstash: string }>([
      ["1"],
      { includeMetadata: true },
    ]).exec(client);

    expect(fetchData[0]?.metadata?.upstash).toBe("test-update");
  });

  test("successfully updates a batch of vectors", async () => {
    const index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    await index.upsert([
      {
        id: "test-1",
        vector: range(0, 384),
        metadata: { upstash: "test-1-not-updated" },
      },
      {
        id: "test-2",
        vector: range(0, 384),
        metadata: { upstash: "test-2-not-updated" },
      },
    ]);

    sleep(5000);

    const res = await index.update([
      {
        id: "test-1",
        metadata: { upstash: "test-1-updated" },
      },
      {
        id: "test-2",
        metadata: { upstash: "test-2-updated" },
      },
    ]);

    expect(res).toEqual({ updated: 2 });

    sleep(2000);

    const fetchData = await index.fetch(["test-1", "test-2"], { includeMetadata: true });

    expect(fetchData[0]?.metadata?.upstash).toBe("test-1-updated");
  });
});
