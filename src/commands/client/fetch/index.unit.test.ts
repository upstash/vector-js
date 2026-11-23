import { describe, expect, test } from "bun:test";
import { FetchCommand } from ".";

describe("FetchCommand - namespace option", () => {
  test("preserves caller namespace option across calls", () => {
    const opts = { namespace: "ns", includeMetadata: true };

    const first = new FetchCommand([["id-1"], opts]);
    const second = new FetchCommand([[1, 2], opts]);

    expect(first.endpoint).toBe("fetch/ns");
    expect(second.endpoint).toBe("fetch/ns");
    expect(opts.namespace).toBe("ns");
    expect(first.payload).toEqual({ ids: ["id-1"], includeMetadata: true });
    expect("namespace" in first.payload).toBe(false);
  });

  test("preserves caller namespace option with object payload", () => {
    const opts = { namespace: "ns", includeData: true };

    const first = new FetchCommand([{ prefix: "doc-" }, opts]);
    const second = new FetchCommand([{ prefix: "item-" }, opts]);

    expect(first.endpoint).toBe("fetch/ns");
    expect(second.endpoint).toBe("fetch/ns");
    expect(opts.namespace).toBe("ns");
    expect(first.payload).toEqual({ prefix: "doc-", includeData: true });
    expect("namespace" in first.payload).toBe(false);
  });
});
