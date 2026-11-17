import { afterEach, describe, expect, test } from "bun:test";
import { Index } from "../platforms/nodejs";

const BASE = "https://vector.example.com";
const originalFetch = globalThis.fetch;

const captureUrls = () => {
  const urls: string[] = [];
  globalThis.fetch = (async (input: unknown) => {
    // resolve the URL the same way fetch does
    urls.push(new URL(String(input)).href);
    return new Response(JSON.stringify({ result: [] }), { status: 200 });
  }) as unknown as typeof fetch;
  return urls;
};

describe("namespace in request path", () => {
  const index = new Index({ url: BASE, token: "token", retry: false });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("namespace names are sent as before", async () => {
    const urls = captureUrls();
    await index.fetch([1], { namespace: "my-namespace_1" });
    await index.namespace("tenant.a").range({ cursor: 0, limit: 1 });
    await index.query({ vector: [0.1], topK: 1 }, { namespace: "user:1@example.com+a=b" });
    await index.upsert({ id: "1", vector: [0.1] }, { namespace: "a,b;c&d$e" });
    await index.delete("1", { namespace: ".hidden" });
    await index.reset({ namespace: "a..b" });
    await index.deleteNamespace("100%25");
    expect(urls).toEqual([
      `${BASE}/fetch/my-namespace_1`,
      `${BASE}/range/tenant.a`,
      `${BASE}/query/user:1@example.com+a=b`,
      `${BASE}/upsert/a,b;c&d$e`,
      `${BASE}/delete/.hidden`,
      `${BASE}/reset/a..b`,
      `${BASE}/delete-namespace/100%25`,
    ]);
  });

  test("reset all is unchanged", async () => {
    const urls = captureUrls();
    await index.reset({ all: true });
    expect(urls).toEqual([`${BASE}/reset?all`]);
  });

  test.each(["a/b", String.raw`a\b`, "a?b", "a#b", "../reset?all", String.raw`..\reset`])(
    "namespace %p is not accepted",
    async (namespace) => {
      const urls = captureUrls();
      expect(() => index.namespace(namespace).fetch([1])).toThrow("Namespace cannot contain");
      expect(() => index.query({ vector: [0.1], topK: 1 }, { namespace })).toThrow(
        "Namespace cannot contain"
      );
      expect(() => index.deleteNamespace(namespace)).toThrow("Namespace cannot contain");
      expect(urls).toEqual([]);
    }
  );

  test.each([".", "..", "%2e", "%2E%2e", ".%2e", ".\t.", ".. ", " ..", "..\n"])(
    "namespace %p is not accepted",
    async (namespace) => {
      const urls = captureUrls();
      expect(() => index.namespace(namespace).fetch([1])).toThrow(
        'Namespace cannot be "." or ".."'
      );
      expect(() => index.deleteNamespace(namespace)).toThrow('Namespace cannot be "." or ".."');
      expect(urls).toEqual([]);
    }
  );
});
