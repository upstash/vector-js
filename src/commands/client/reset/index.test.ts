import { describe, expect, test } from "bun:test";
import { FetchCommand, ResetCommand, UpsertCommand } from "@commands/index";
import { awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";

const client = newHttpClient();

describe("RESET", () => {
  test(
    "should flush indexes successfully",
    async () => {
      const randomizedData = new Array(20)
        .fill("")
        .map(() => ({ id: randomID(), vector: range(0, 384) }));

      await new UpsertCommand(randomizedData).exec(client);
      await awaitUntilIndexed(client);

      const res = await new FetchCommand([
        randomizedData.map((x) => x.id),
        {
          includeVectors: true,
        },
      ]).exec(client);

      expect(res).toEqual(randomizedData);

      await new ResetCommand().exec(client);
      await awaitUntilIndexed(client);

      const resAfterReset = await new FetchCommand([
        randomizedData.map((x) => x.id),
        {
          includeVectors: true,
        },
      ]).exec(client);

      expect(resAfterReset).toEqual(new Array(20).fill(null));
    },
    { timeout: 30000 },
  );
});
