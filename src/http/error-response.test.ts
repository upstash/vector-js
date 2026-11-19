import { afterAll, describe, expect, test } from "bun:test";
import { serve } from "bun";
import { HttpClient } from "./";

describe("error responses", () => {
  const responses: Record<string, () => Response> = {
    "/json-error": () => Response.json({ error: "index is paused" }, { status: 400 }),
    "/null-body": () => new Response("null", { status: 503 }),
    "/html-body": () => new Response("<html>Bad Gateway</html>", { status: 502 }),
    "/empty-body": () => new Response("", { status: 500 }),
    "/ok-not-json": () => new Response("not json", { status: 200 }),
    "/ok": () => Response.json({ result: "Success" }),
  };
  const server = serve({
    port: 0,
    fetch: (request) => responses[new URL(request.url).pathname](),
  });
  const client = new HttpClient({ baseUrl: `http://localhost:${server.port}`, retry: false });

  afterAll(() => {
    server.stop(true);
  });

  const failure = async (path: string) => {
    try {
      await client.request({ path: [path] });
    } catch (error) {
      return error as Error;
    }
    throw new Error("request did not fail");
  };

  test("uses the error field of a JSON error response", async () => {
    const error = await failure("json-error");
    expect(error.name).toBe("UpstashError");
    expect(error.message).toBe("index is paused");
  });

  test("reports the status when the error body is null", async () => {
    const error = await failure("null-body");
    expect(error.name).toBe("UpstashError");
    expect(error.message).toContain("503");
  });

  test("reports the status and body when the error body is not JSON", async () => {
    const error = await failure("html-body");
    expect(error.name).toBe("UpstashError");
    expect(error.message).toContain("502");
    expect(error.message).toContain("Bad Gateway");
  });

  test("reports the status when the error body is empty", async () => {
    const error = await failure("empty-body");
    expect(error.name).toBe("UpstashError");
    expect(error.message).toContain("500");
  });

  test("fails with a clear error when a successful response is not JSON", async () => {
    const error = await failure("ok-not-json");
    expect(error.name).toBe("UpstashError");
    expect(error.message).toContain("not json");
  });

  test("returns the result of a successful response", async () => {
    const response = await client.request<string>({ path: ["ok"] });
    expect(response.result).toBe("Success");
  });
});
