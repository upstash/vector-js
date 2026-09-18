import { describe, expect, test } from "bun:test";
import type { Requester, UpstashResponse } from "@http";
import { QueryManyCommand } from ".";

/**
 * Isolated unit tests for QueryManyCommand's single-query response
 * normalization, using a mocked Requester instead of a live Upstash Vector
 * index. index.test.ts covers the same normalization against a real index,
 * but that requires live credentials and can't cheaply exercise the
 * zero-match case (an empty index or a filter guaranteed to match nothing).
 * These tests document exactly what the raw API response shape is assumed
 * to be for each case, mocked at the Requester boundary.
 */
function mockRequester(result: unknown): Requester {
  return {
    request: async <TResult>() => ({ result }) as UpstashResponse<TResult>,
  };
}

describe("QueryManyCommand - single query response normalization", () => {
  test("wraps a flat non-empty result into a nested array", async () => {
    const flatResult = [{ id: "1", score: 0.9 }];
    const command = new QueryManyCommand([{ vector: [0.1], topK: 1 }]);

    const res = await command.exec(mockRequester(flatResult));

    expect(res).toEqual([[{ id: "1", score: 0.9 }]]);
  });

  test("wraps a flat empty result (zero matches) into a nested array, not an empty array", async () => {
    const command = new QueryManyCommand([{ vector: [0.1], topK: 1 }]);

    const res = await command.exec(mockRequester([]));

    // Before the fix, this returned [] instead of [[]], breaking the
    // documented QueryResult[][] contract and making res[0] undefined
    // for a caller reading the first (only) query's matches.
    expect(res).toEqual([[]]);
    expect(res.length).toBe(1);
    expect(Array.isArray(res[0])).toBe(true);
  });

  test("passes through an already-nested result unchanged for multiple queries", async () => {
    const nestedResult = [[{ id: "1", score: 0.9 }], [{ id: "2", score: 0.8 }]];
    const command = new QueryManyCommand([
      { vector: [0.1], topK: 1 },
      { vector: [0.2], topK: 1 },
    ]);

    const res = await command.exec(mockRequester(nestedResult));

    expect(res).toEqual(nestedResult);
  });

  test("passes through zero matches across multiple queries unchanged", async () => {
    const nestedResult = [[], []];
    const command = new QueryManyCommand([
      { vector: [0.1], topK: 1 },
      { vector: [0.2], topK: 1 },
    ]);

    const res = await command.exec(mockRequester(nestedResult));

    expect(res).toEqual([[], []]);
  });
});
