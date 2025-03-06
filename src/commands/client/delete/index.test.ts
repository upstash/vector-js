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
    await awaitUntilIndexed(client);

    const res1 = await new DeleteCommand(id).exec(client);
    expect(res1).toEqual({
      deleted: 1,
    });
  });

  test("should delete using object with ids", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [randomID(), randomID(), randomID()];

    await new UpsertCommand(idsToUpsert.map((x) => ({ id: x, vector: initialVector }))).exec(
      client
    );
    await awaitUntilIndexed(client);

    const res = await new DeleteCommand({ ids: idsToUpsert }).exec(client);
    expect(res).toEqual({
      deleted: 3,
    });
  });

  test("should delete by prefix", async () => {
    const initialVector = range(0, 384);
    const prefix = "test_prefix_";
    const idsToUpsert = [`${prefix}1`, `${prefix}2`, `${prefix}3`, "different_prefix_1"];

    await new UpsertCommand(idsToUpsert.map((x) => ({ id: x, vector: initialVector }))).exec(
      client
    );
    await awaitUntilIndexed(client);

    const res = await new DeleteCommand({ prefix: prefix }).exec(client);
    expect(res).toEqual({
      deleted: 3,
    });
  });

  test("should delete by filter", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [
      {
        id: randomID(),
        vector: initialVector,
        metadata: { type: "animal", category: "mammal" },
      },
      {
        id: randomID(),
        vector: initialVector,
        metadata: { type: "animal", category: "reptile" },
      },
      {
        id: randomID(),
        vector: initialVector,
        metadata: { type: "plant" },
      },
    ];

    await new UpsertCommand(idsToUpsert).exec(client);
    await awaitUntilIndexed(client);

    const res = await new DeleteCommand({ filter: "type = 'animal'" }).exec(client);
    expect(res).toEqual({
      deleted: 2,
    });
  });

  test("should throw when multiple delete criteria are provided", async () => {
    expect(new DeleteCommand({ ids: ["1"], prefix: "test_" }).exec(client)).rejects.toThrow(
      "Only and only one of the ids, prefix, or filter must be provided."
    );
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
    await awaitUntilIndexed(client);

    const deletionResult = await index.delete(id);

    expect(deletionResult).toEqual({
      deleted: 1,
    });
  });

  test("should delete array of records successfully", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [randomID(), randomID(), randomID()];

    await index.upsert(idsToUpsert.map((id) => ({ id, vector: initialVector })));
    await awaitUntilIndexed(client);

    const deletionResult = await index.delete(idsToUpsert);
    expect(deletionResult).toEqual({
      deleted: 3,
    });
  });

  test("should delete by prefix using index client", async () => {
    const initialVector = range(0, 384);
    const prefix = "test_prefix_";
    const idsToUpsert = [`${prefix}1`, `${prefix}2`, `${prefix}3`, "different_prefix_1"];

    await index.upsert(idsToUpsert.map((id) => ({ id, vector: initialVector })));
    await awaitUntilIndexed(client);

    const deletionResult = await index.delete({ prefix });
    expect(deletionResult).toEqual({
      deleted: 3,
    });
  });

  test("should delete by filter using index client", async () => {
    const initialVector = range(0, 384);
    const idsToUpsert = [
      {
        id: randomID(),
        vector: initialVector,
        metadata: { type: "animal", category: "mammal" },
      },
      {
        id: randomID(),
        vector: initialVector,
        metadata: { type: "animal", category: "reptile" },
      },
      {
        id: randomID(),
        vector: initialVector,
        metadata: { type: "plant" },
      },
    ];

    await index.upsert(idsToUpsert);
    await awaitUntilIndexed(client);

    const deletionResult = await index.delete({ filter: "type = 'animal'" });
    expect(deletionResult).toEqual({
      deleted: 2,
    });
  });
});

describe("DELETE with Index Client and Namespaces", () => {
  const index = new Index();
  const namespace = "test_namespace";

  afterAll(async () => {
    await index.reset();
  });

  test("should delete single record in namespace", async () => {
    const initialVector = range(0, 384);
    const id = randomID();

    await index.upsert({ id, vector: initialVector }, { namespace });
    await awaitUntilIndexed(client);

    const deletionResult = await index.delete(id, { namespace });
    expect(deletionResult).toEqual({
      deleted: 1,
    });
  });

  test("should delete by prefix in namespace", async () => {
    const initialVector = range(0, 384);
    const prefix = "test_prefix_";
    const idsToUpsert = [`${prefix}1`, `${prefix}2`, `${prefix}3`, "different_prefix_1"];

    await index.upsert(
      idsToUpsert.map((id) => ({ id, vector: initialVector })),
      { namespace }
    );
    await awaitUntilIndexed(client);

    const deletionResult = await index.delete({ prefix }, { namespace });
    expect(deletionResult).toEqual({
      deleted: 3,
    });
  });
});
