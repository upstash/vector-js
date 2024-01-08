import { describe, expect, test } from "bun:test";
import { newHttpClient } from "../../../utils/test-utils";
import { QueryCommand } from "./index";
import { UpsertCommand } from "../upsert";

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

    expect(res).toBeTruthy();
  });
});
