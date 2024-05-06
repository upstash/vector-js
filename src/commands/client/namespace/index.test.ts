import { afterAll, describe, expect, test } from "bun:test";
import { range, resetIndexes } from "@utils/test-utils";

import { sleep } from "bun";
import { Index } from "../../../../index";

describe("NAMESPACE", () => {
  afterAll(async () => await resetIndexes());

  test("should append to specific namespace", async () => {
    const index = new Index();

    const namespace1 = index.namespace("test-namespace-1");

    const namespace2 = index.namespace("test-namespace-2");

    await namespace1.upsert({
      id: 1,
      vector: range(0, 384),
      metadata: { namespace: "namespace1" },
    });

    await namespace2.upsert({
      id: 2,
      vector: range(0, 384),
      metadata: { namespace: "namespace2" },
    });

    sleep(3000);

    const query1 = await namespace1.query({
      vector: range(0, 384),
      topK: 3,
      includeMetadata: true,
    });
    const query2 = await namespace2.query({
      vector: range(0, 384),
      topK: 3,
      includeMetadata: true,
    });

    expect(query1.length).toEqual(1);
    expect(query2.length).toEqual(1);
    expect(query1[0].metadata?.namespace).toEqual("namespace1");
    expect(query2[0].metadata?.namespace).toEqual("namespace2");
  });
});