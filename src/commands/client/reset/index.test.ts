import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { FetchCommand, type FetchResult, ResetCommand, UpsertCommand } from "@commands/index";
import { Index, awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";

const client = newHttpClient();

describe("RESET", () => {
  test(
    "should flush indexes successfully",
    async () => {
      const randomizedData = Array.from({ length: 20 })
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

      expect(resAfterReset).toEqual(Array.from({ length: 20 }).fill(null) as FetchResult[]);
    },
    { timeout: 30_000 }
  );

  describe("reset options", () => {
    const namespaces = ["ns-1", "ns-2"];
    const index = new Index({
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      url: process.env.UPSTASH_VECTOR_REST_URL!,
    });

    const vectorCount = 5;
    const vectorIds = Array.from({ length: vectorCount })
      .fill("")
      .map((_, index) => `vector-${index}`);

    beforeEach(async () => {
      // insert vertors to the default namespace and to the two namespaces
      await Promise.all(
        [undefined, ...namespaces].map(async (ns) => {
          const randomizedData = Array.from({ length: vectorCount })
            .fill("")
            .map((_, index) => ({ id: vectorIds[index], vector: range(0, 384) }));

          await new UpsertCommand(randomizedData, { namespace: ns }).exec(client);
          await awaitUntilIndexed(client);
        })
      );

      const info = await index.info();
      expect(info.namespaces[""].vectorCount).toBe(vectorCount);
      expect(info.namespaces[namespaces[0]].vectorCount).toBe(vectorCount);
      expect(info.namespaces[namespaces[1]].vectorCount).toBe(vectorCount);
    });

    afterEach(async () => {
      await index.reset({ all: true });

      // make sure that index is empty
      const info = await index.info();
      expect(info.vectorCount).toBe(0);
    });

    test("should reset default namespace", async () => {
      await index.reset();
      const info = await index.info();

      expect(info.namespaces[""].vectorCount).toBe(0);
      expect(info.namespaces[namespaces[0]].vectorCount).toBe(vectorCount);
      expect(info.namespaces[namespaces[1]].vectorCount).toBe(vectorCount);
    });

    test("should reset given namespace", async () => {
      await index.reset({ namespace: namespaces[0] });
      const info = await index.info();

      expect(info.namespaces[""].vectorCount).toBe(vectorCount);
      expect(info.namespaces[namespaces[0]].vectorCount).toBe(0);
      expect(info.namespaces[namespaces[1]].vectorCount).toBe(vectorCount);
    });

    test("should reset all namespaces", async () => {
      await index.reset({ all: true });
      const info = await index.info();

      expect(info.namespaces[""].vectorCount).toBe(0);
      expect(info.namespaces[namespaces[0]].vectorCount).toBe(0);
      expect(info.namespaces[namespaces[1]].vectorCount).toBe(0);
    });
  });
});
