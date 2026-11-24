import { describe, expect, test } from "bun:test";
import type { Requester, UpstashRequest, UpstashResponse } from "@http";
import { Index } from "../../../vector";

/** Offline tests for Namespace.fetch with a recording Requester. */
function recordingRequester() {
  const requests: UpstashRequest[] = [];
  const requester: Requester = {
    request: async <TResult>(req: UpstashRequest) => {
      requests.push(req);
      return { result: [] } as UpstashResponse<TResult>;
    },
  };
  return { requester, requests };
}

describe("Namespace.fetch - caller options", () => {
  test("does not leak the namespace into an options object reused across calls", async () => {
    const { requester, requests } = recordingRequester();
    const index = new Index(requester);
    const opts = { includeMetadata: true };

    await index.namespace("tenant-a").fetch(["1"], opts);
    await index.fetch(["1"], opts);
    await index.namespace("tenant-b").fetch(["1"], opts);
    await index.fetch(["1"], opts);

    expect(requests.map((r) => r.path)).toEqual([
      ["fetch/tenant-a"],
      ["fetch"],
      ["fetch/tenant-b"],
      ["fetch"],
    ]);
    expect(opts).toEqual({ includeMetadata: true });
  });

  test("accepts a frozen options object", async () => {
    const { requester, requests } = recordingRequester();
    const index = new Index(requester);

    await index.namespace("tenant-a").fetch(["1"], Object.freeze({ includeMetadata: true }));

    expect(requests).toEqual([
      { path: ["fetch/tenant-a"], body: { ids: ["1"], includeMetadata: true } },
    ]);
  });
});
