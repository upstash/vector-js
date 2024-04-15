import { afterAll, describe, expect, test } from "bun:test";
import { DeleteCommand, UpsertCommand } from "@commands/index";
import { newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";

const client = newHttpClient();

describe("DELETE", () => {
  afterAll(async () => await resetIndexes());

  test("should delete record(s) successfully", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [randomID(), randomID(), randomID()];

    const upsertPromises = idsToUpsert.map((id) =>
      new UpsertCommand({ id, vector: initialVector }).exec(client)
    );
    await Promise.all(upsertPromises);

    const deletionResult = await new DeleteCommand(idsToUpsert).exec(client);
    expect(deletionResult).toBeTruthy();
  });

  test("deleting the same ids should throw", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [randomID(), randomID(), randomID()];

    const upsertPromises = idsToUpsert.map((id) =>
      new UpsertCommand({ id, vector: initialVector }).exec(client)
    );
    await Promise.all(upsertPromises);

    await new DeleteCommand(idsToUpsert).exec(client);
    const res1 = await new DeleteCommand(idsToUpsert).exec(client);
    expect(res1).toEqual({
      deleted: 0,
    });
  });

  test("should delete single item", async () => {
    const initialVector = range(0, 384);
    const id = randomID();
    await new UpsertCommand({ id, vector: initialVector }).exec(client);

    const res1 = await new DeleteCommand(id).exec(client);
    expect(res1).toEqual({
      deleted: 1,
    });
  });
});
