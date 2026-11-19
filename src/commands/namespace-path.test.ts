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

  test("ordinary namespace names are sent as before", async () => {
    const urls = captureUrls();
    await index.fetch([1], { namespace: "my-namespace_1" });
    await index.namespace("tenant.a").range({ cursor: 0, limit: 1 });
    await index.delete("1", { namespace: "a..b" });
    expect(urls).toEqual([
      `${BASE}/fetch/my-namespace_1`,
      `${BASE}/range/tenant.a`,
      `${BASE}/delete/a..b`,
    ]);
  });

  test("reset all is unchanged", async () => {
    const urls = captureUrls();
    await index.reset({ all: true });
    expect(urls).toEqual([`${BASE}/reset?all`]);
  });

  test.each([
    ["a?b", "a%3Fb"],
    ["a#b", "a%23b"],
    ["a b", "a%20b"],
    ["user:1@example.com", "user%3A1%40example.com"],
    ["a+b=c", "a%2Bb%3Dc"],
    ["..?all", "..%3Fall"],
    [".. ", "..%20"],
  ])("namespace %p stays a single path segment", async (namespace, encoded) => {
    const urls = captureUrls();
    await index.query({ vector: [0.1], topK: 1 }, { namespace });
    await index.upsert({ id: "1", vector: [0.1] }, { namespace });
    await index.delete("1", { namespace });
    await index.reset({ namespace });
    await index.deleteNamespace(namespace);
    expect(urls).toEqual([
      `${BASE}/query/${encoded}`,
      `${BASE}/upsert/${encoded}`,
      `${BASE}/delete/${encoded}`,
      `${BASE}/reset/${encoded}`,
      `${BASE}/delete-namespace/${encoded}`,
    ]);
  });

  test.each(["a/b", String.raw`a\b`, "../reset?all", "100%", "%2e%2e", "a%2Fb"])(
    "namespace %p is not accepted",
    async (namespace) => {
      const urls = captureUrls();
      await expect(index.namespace(namespace).fetch([1])).rejects.toThrow(
        "Namespace cannot contain"
      );
      await expect(index.deleteNamespace(namespace)).rejects.toThrow("Namespace cannot contain");
      await expect(index.reset({ namespace })).rejects.toThrow("Namespace cannot contain");
      expect(urls).toEqual([]);
    }
  );

  test.each([".", ".."])("namespace %p is not accepted", async (namespace) => {
    const urls = captureUrls();
    await expect(index.namespace(namespace).fetch([1])).rejects.toThrow(
      'Namespace cannot be "." or ".."'
    );
    await expect(index.deleteNamespace(namespace)).rejects.toThrow(
      'Namespace cannot be "." or ".."'
    );
    expect(urls).toEqual([]);
  });

  test("a percent-encoded namespace is reported with a hint", async () => {
    await expect(index.namespace(encodeURIComponent("my ns")).fetch([1])).rejects.toThrow(
      "without percent-encoding"
    );
  });

  test.each(["vic\ttim", "a\nb", "a\rb", "a\u0000b", "\u0000invalid-namespace:x"])(
    "namespace %p with a control character is not accepted",
    async (namespace) => {
      const urls = captureUrls();
      await expect(index.namespace(namespace).fetch([1])).rejects.toThrow("control characters");
      await expect(index.deleteNamespace(namespace)).rejects.toThrow("control characters");
      expect(urls).toEqual([]);
    }
  );

  test("a numeric namespace is converted to a string", async () => {
    const urls = captureUrls();
    const numeric = Number("42") as unknown as string;
    await index.namespace(numeric).fetch([1]);
    await index.deleteNamespace(numeric);
    expect(urls).toEqual([`${BASE}/fetch/42`, `${BASE}/delete-namespace/42`]);
  });

  test("a namespace that is not a string or number is not accepted", async () => {
    const urls = captureUrls();
    const value = { toString: () => "ns" } as unknown as string;
    await expect(index.namespace(value).fetch([1])).rejects.toThrow("Namespace must be a string");
    expect(urls).toEqual([]);
  });
});
