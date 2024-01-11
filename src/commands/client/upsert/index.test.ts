import { afterAll, describe, expect, test } from "bun:test";
import { UpsertCommand } from ".";
import { newHttpClient, resetIndexes } from "../../../utils/test-utils";

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

  // biome-ignore lint/nursery/useAwait: required to test bad payloads
  test("should return an error when id is missing", async () => {
    const throwable = async () => {
      //@ts-ignore
      await new UpsertCommand({ vector: [0.1, 0.2] }).exec(client);
    };
    expect(throwable).toThrow();
  });

  // biome-ignore lint/nursery/useAwait: required to test bad payloads
  test("should return an error when id is missing", async () => {
    const throwable = async () => {
      //@ts-ignore
      await new UpsertCommand({ vector: [0.1, 0.2] }).exec(client);
    };
    expect(throwable).toThrow();
  });

  test("should add data successfully with a metadata", async () => {
    //@ts-ignore
    const res = await new UpsertCommand({
      id: 1,
      vector: [0.1, 0.2],
      metadata: { upstash: test },
    }).exec(client);
    expect(res).toEqual("Success");
  });
});
