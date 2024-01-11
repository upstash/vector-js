import { afterAll, describe, expect, test } from "bun:test";
import { newHttpClient, randomID, resetIndexes } from "../../../utils/test-utils";
import { UpsertCommand } from "../upsert";
import { DeleteCommand } from "./";

const client = newHttpClient();

describe("DELETE", () => {
  afterAll(async () => await resetIndexes());

  test("should delete record(s) successfully", async () => {
    const initialVector = [6.6, 7.7];
    const idsToUpsert = [randomID(), randomID(), randomID()];

    const upsertPromises = idsToUpsert.map((id) =>
      new UpsertCommand({ id, vector: initialVector }).exec(client)
    );
    await Promise.all(upsertPromises);

    const deletionResult = await new DeleteCommand({ ids: idsToUpsert }).exec(client);
    expect(deletionResult).toBeTruthy();
  });

  test("deleting the same ids should throw", () => {
    const throwable = async () => {
      const initialVector = [6.6, 7.7];
      const idsToUpsert = [randomID(), randomID(), randomID()];

      const upsertPromises = idsToUpsert.map((id) =>
        new UpsertCommand({ id, vector: initialVector }).exec(client)
      );
      await Promise.all(upsertPromises);

      await new DeleteCommand({ ids: idsToUpsert }).exec(client);
      //This should throw
      await new DeleteCommand({ ids: idsToUpsert }).exec(client);
    };
    expect(throwable).toThrow();
  });
});
