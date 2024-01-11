import { describe, expect, test } from "bun:test";
import { newHttpClient } from "../../../utils/test-utils";
import { UpsertCommand } from "../upsert";
import { QueryCommand } from "./index";

const client = newHttpClient();

describe("QUERY", () => {
  test("should query records successfully", async () => {
    const initialVector = [6.6, 7.7];
    const initialData = { id: 33, vector: initialVector };
    await new UpsertCommand(initialData).exec(client);

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
