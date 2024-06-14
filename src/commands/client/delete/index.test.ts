import { afterAll, describe, expect, test } from "bun:test";
import { DeleteCommand, UpsertCommand } from "@commands/index";
import { awaitUntilIndexed, newHttpClient, randomID, range, resetIndexes } from "@utils/test-utils";
import { Index } from "@utils/test-utils";

const client = newHttpClient();

describe("DELETE", () => {
  afterAll(async () => await resetIndexes());

  test("should delete record(s) successfully", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [randomID(), randomID(), randomID()];

    await new UpsertCommand(idsToUpsert.map((x) => ({ id: x, vector: initialVector }))).exec(
      client
    );
    await awaitUntilIndexed(client);

    const deletionResult = await new DeleteCommand(idsToUpsert).exec(client);
    expect(deletionResult).toBeTruthy();
  });

  test("deleting the same ids should throw", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [randomID(), randomID(), randomID()];

    await new UpsertCommand(idsToUpsert.map((x) => ({ id: x, vector: initialVector }))).exec(
      client
    );
    await awaitUntilIndexed(client);

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

describe("DELETE with Index Client", () => {
  const index = new Index();
  afterAll(async () => {
    await index.reset();
  });

  test("should delete single record succesfully", async () => {
    const initialVector = range(0, 384);
    const id = randomID();

    index.upsert({ id, vector: initialVector });

    const deletionResult = await index.delete(id);

    expect(deletionResult).toEqual({
      deleted: 1,
    });
  });

  test("should delete array of records successfully", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [randomID(), randomID(), randomID()];

    await index.upsert(idsToUpsert.map((id) => ({ id, vector: initialVector })));

    const deletionResult = await index.delete(idsToUpsert);
    expect(deletionResult).toEqual({
      deleted: 3,
    });
  });
});
