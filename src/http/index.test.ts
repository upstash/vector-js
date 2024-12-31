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

describe("retry", () => {
  test("should terminate after sleeping 5 times", async () => {
    // init a cient which will always get errors
    const client = newHttpClient(
      {
        retries: 5,
        backoff: (retryCount) => Math.exp(retryCount) * 50,
      },
      {
        url: "",
        token: "non-existent",
      }
    );

    // get should take 4.287 seconds and terminate before the timeout.
    const throws = () =>
      Promise.race([
        client.request({
          path: ["upsert"],
          body: "wrong-body",
        }),
        new Promise((r) => setTimeout(r, 4500)),
      ]);

    // if the Promise.race doesn't throw, that means the retries took longer than 4.5s
    expect(throws).toThrow("fetch() URL is invalid");
  });
});
