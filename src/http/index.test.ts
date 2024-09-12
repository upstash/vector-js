import { describe, expect, test } from "bun:test";
import { newHttpClient } from "@utils/test-utils";
import { HttpClient } from "./";

test("remove trailing slash from urls", () => {
  const client = new HttpClient({ baseUrl: "https://example.com/" });

  expect(client.baseUrl).toEqual("https://example.com");
});

describe(new URL("", import.meta.url).pathname, () => {
  describe("when the request is invalid", () => {
    test(
      "throws",
      async () => {
        const client = newHttpClient();
        let hasThrown = false;
        await client.request({ body: ["get", "1", "2"] }).catch(() => {
          hasThrown = true;
        });
        expect(hasThrown).toBeTrue();
      },
      { timeout: 20_000 }
    );
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

    const bodyResponse = await body;
    expect(bodyResponse.result).toEqual("Abort works!");
  });
});
