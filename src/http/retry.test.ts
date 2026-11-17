import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { Index as NodeClient } from "../platforms/nodejs";
import { Index as CloudflareClient } from "../platforms/cloudflare";
import type { RetryConfig } from "./";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

for (const [platform, Client] of [
  ["nodejs", NodeClient],
  ["cloudflare", CloudflareClient],
] as const) {
  describe(`${platform} retry configuration`, () => {
    for (const scenario of [
      {
        name: "disabled retries reject the first failure even if a later call would succeed",
        retry: false,
        failures: 1,
        calls: 1,
        rejects: true,
      },
      {
        name: "disabled retries make one attempt when every call fails",
        retry: false,
        failures: 9,
        calls: 1,
        rejects: true,
      },
      {
        name: "disabled retries return the first successful response",
        retry: false,
        failures: 0,
        calls: 1,
        rejects: false,
      },
      {
        name: "zero retries make one attempt",
        retry: { retries: 0, backoff: () => 0 },
        failures: 1,
        calls: 1,
        rejects: true,
      },
      {
        name: "one retry recovers from one failure",
        retry: { retries: 1, backoff: () => 0 },
        failures: 1,
        calls: 2,
        rejects: false,
      },
      {
        name: "two retries recover from two failures",
        retry: { retries: 2, backoff: () => 0 },
        failures: 2,
        calls: 3,
        rejects: false,
      },
      {
        name: "two retries stop after three failed attempts",
        retry: { retries: 2, backoff: () => 0 },
        failures: 9,
        calls: 3,
        rejects: true,
      },
    ] satisfies {
      name: string;
      retry: RetryConfig;
      failures: number;
      calls: number;
      rejects: boolean;
    }[]) {
      test(scenario.name, async () => {
        const error = new TypeError("synthetic connection lost");
        const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
          new Response(JSON.stringify({ result: "Success" }))
        );
        for (let attempt = 0; attempt < scenario.failures; attempt++) {
          fetchMock.mockRejectedValueOnce(error);
        }
        const client = new Client({
          url: "https://offline.invalid",
          token: "synthetic",
          enableTelemetry: false,
          retry: scenario.retry,
        });

        const result = client.upsert({ id: "doc-1", vector: [1, 0] });
        await (scenario.rejects
          ? expect(result).rejects.toBe(error)
          : expect(result).resolves.toBe("Success"));
        expect(fetchMock).toHaveBeenCalledTimes(scenario.calls);
      });
    }
  });
}
