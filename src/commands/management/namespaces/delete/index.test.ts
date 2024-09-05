import { describe, expect, test } from "bun:test";
import { DeleteNamespaceCommand, ListNamespacesCommand, UpsertCommand } from "@commands/index";
import { awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";

const client = newHttpClient();

describe("NAMESPACES->DELETE", () => {
  test("should return the list of namespaces", async () => {
    await new UpsertCommand(
      { id: randomID(), vector: range(0, 384) },
      { namespace: "test-namespace-delete" },
    ).exec(client);

    await awaitUntilIndexed(client);

    const namespaces = await new ListNamespacesCommand().exec(client);

    expect(namespaces).toContain("test-namespace-delete");

    await new DeleteNamespaceCommand("test-namespace-delete").exec(client);

    const namespacesAfterDelete = await new ListNamespacesCommand().exec(client);

    expect(namespacesAfterDelete).not.toContain("test-namespace-delete");
  });
});
