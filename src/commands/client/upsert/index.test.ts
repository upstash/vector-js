import { afterAll, describe, expect, test } from "bun:test";
import { UpsertCommand } from "@commands/index";
import { newHttpClient, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("UPSERT", () => {
  afterAll(async () => await resetIndexes());

  test("should add record successfully", async () => {
    const res = await new UpsertCommand({ id: 1, vector: [0.1, 0.2] }).exec(client);
    expect(res).toEqual("Success");
  });

  // biome-ignore lint/nursery/useAwait: required to test bad payloads
  test("should return an error when vector is missing", async () => {
    const throwable = async () => {
      //@ts-ignore
      await new UpsertCommand({ id: 1 }).exec(client);
    };
    expect(throwable).toThrow();
  });

  test("should add data successfully with a metadata", async () => {
    //@ts-ignore
    const res = await new UpsertCommand({
      id: 1,
      vector: [0.1, 0.2],
      metadata: { upstash: "test" },
    }).exec(client);
    expect(res).toEqual("Success");
  });

  test("should add bulk data with string id", async () => {
    //@ts-ignore
    const res = await new UpsertCommand([
      {
        id: "hello-world",
        vector: [0.1, 0.2],
        metadata: { upstash: "test" },
      },
      {
        id: "hello-world-4",
        vector: [3, 4],
        metadata: { upstash: "test" },
      },
    ]).exec(client);
    expect(res).toEqual("Success");
  });
});
