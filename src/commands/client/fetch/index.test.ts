import { afterAll, describe, expect, test } from "bun:test";
import { FetchCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, randomFloat, randomID, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("FETCH", () => {
  afterAll(async () => await resetIndexes());

  test("should fetch records successfully", async () => {
    const randomizedData = new Array(20)
      .fill("")
      .map(() => ({ id: randomID(), vector: [randomFloat(), randomFloat()] }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));
    await Promise.all(payloads);

    const res = await new FetchCommand({
      ids: randomizedData.map((x) => x.id),
      includeVectors: true,
    }).exec(client);

    expect(res).toEqual(randomizedData);
  });

  test("should return null when id does not exist", async () => {
    const res = await new FetchCommand({
      ids: [randomID()],
      includeVectors: true,
    }).exec(client);

    expect(res).toEqual([null]);
  });

  test("should return with metadata", async () => {
    const mockData = {
      id: randomID(),
      vector: [randomFloat(), randomFloat()],
      metadata: { hello: "world" },
    };
    await new UpsertCommand(mockData).exec(client);

    const res = await new FetchCommand<{ hello: string }>({
      ids: [mockData.id],
      includeVectors: true,
      includeMetadata: true,
    }).exec(client);

    expect(res).toEqual([mockData]);
  });
});
