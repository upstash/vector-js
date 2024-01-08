import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { HttpClient } from "./";

import { newHttpClient } from "../utils/test-utils";

test("remove trailing slash from urls", () => {
  const client = new HttpClient({ baseUrl: "https://example.com/" });

  expect(client.baseUrl).toEqual("https://example.com");
});

describe(new URL("", import.meta.url).pathname, () => {
  describe("when the request is invalid", () => {
    test("throws", async () => {
      const client = newHttpClient();
      let hasThrown = false;
      await client.request({ body: ["get", "1", "2"] }).catch(() => {
        hasThrown = true;
      });
      expect(hasThrown).toBeTrue();
    });
  });

  describe("whithout authorization", () => {
    test("throws", async () => {
      const client = newHttpClient();
      client.headers = {};
      let hasThrown = false;
      await client.request({ body: ["get", "1", "2"] }).catch(() => {
        hasThrown = true;
      });
      expect(hasThrown).toBeTrue();
    });
  });
});

describe("Abort", () => {
  test("should abort the request", async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    const client = newHttpClient();
    client.options.signal = signal;
    const body = client.request({
      body: ["set", "name", "hezarfen"],
    });
    controller.abort("Abort works!");

    expect((await body).result).toEqual("Abort works!");
  });
});

describe("Test retry", () => {
  let originalFetch: typeof global.fetch;
  let fetchCallCount: number;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchCallCount = 0;
  });

  afterEach(() => {
    // Restore the original fetch after each test
    global.fetch = originalFetch;
  });

  function mockFetchToFailTwiceThenSucceed() {
    global.fetch = mock(() => {
      fetchCallCount += 1;
      if (fetchCallCount <= 2) {
        return Promise.reject(new Error("Network failure"));
      }
      return Promise.resolve(new Response(JSON.stringify({ data: "success" })));
    });
  }

  test("retry logic on network failure", async () => {
    mockFetchToFailTwiceThenSucceed();

    const client = newHttpClient({ retries: 3 });

    try {
      await client.request({ path: ["test"] });
    } catch {}

    expect(global.fetch).toHaveBeenCalledTimes(3); // Check if fetch was called 3 times
  });
});
