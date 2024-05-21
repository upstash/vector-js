import { afterAll, describe, expect, test } from "bun:test";
import { awaitUntilIndexed, range, resetIndexes } from "@utils/test-utils";

import { Index } from "../../../../index";

describe("NAMESPACE", () => {
  afterAll(async () => await resetIndexes());

  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  });

  test("should append to specific namespace", async () => {
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

    await awaitUntilIndexed(index);

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

  test("should reset namespace", async () => {
    const namespace = index.namespace("test-namespace-reset");

    await namespace.upsert({
      id: 1,
      vector: range(0, 384),
      metadata: { namespace: "test-namespace-reset" },
    });

    await awaitUntilIndexed(index);

    const res = await namespace.query({
      vector: range(0, 384),
      topK: 3,
      includeMetadata: true,
    });
    expect(res.length).toEqual(1);

    await namespace.reset();

    const res2 = await namespace.query({
      vector: range(0, 384),
      topK: 3,
      includeMetadata: true,
    });

    expect(res2.length).toEqual(0);
  });
});
