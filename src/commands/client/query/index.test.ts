import { afterAll, describe, expect, test } from "bun:test";
import { sleep } from "bun";
import { newHttpClient, resetIndexes } from "../../../utils/test-utils";
import { UpsertCommand } from "../upsert";
import { QueryCommand } from "./index";

const client = newHttpClient();

describe("QUERY", () => {
  afterAll(async () => await resetIndexes());

  test("should query records successfully", async () => {
    const initialVector = [6.6, 7.7];
    const initialData = { id: 33, vector: initialVector };

    await new UpsertCommand(initialData).exec(client);
    //This is needed for vector index insertion to happen. When run with other tests in parallel this tends to fail without sleep. But, standalone it should work without an issue.
    await sleep(2000);
    const res = await new QueryCommand({
      includeVectors: true,
      vector: initialVector,
      topK: 1,
    }).exec(client);
    expect(res).toEqual([
      {
        id: "33",
        score: 1,
        vector: [6.6, 7.7],
      },
    ]);
  });
});
