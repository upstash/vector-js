import { describe, expect, test } from "bun:test";
import { FetchCommand, ResetCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, randomFloat, randomID } from "@utils/test-utils";

const client = newHttpClient();

describe("RESET", () => {
  test("should flush indexes successfully", async () => {
    const randomizedData = new Array(20)
      .fill("")
      .map(() => ({ id: randomID(), vector: [randomFloat(), randomFloat()] }));

    const payloads = randomizedData.map((data) => new UpsertCommand(data).exec(client));

    await Promise.all(payloads);

    const res = await new FetchCommand([
      randomizedData.map((x) => x.id),
      {
        includeVectors: true,
      },
    ]).exec(client);

    expect(res).toEqual(randomizedData);

    await new ResetCommand().exec(client);
    const resAfterReset = await new FetchCommand([
      randomizedData.map((x) => x.id),
      {
        includeVectors: true,
      },
    ]).exec(client);

    expect(resAfterReset).toEqual(new Array(20).fill(null));
  });
});
