import { HttpClient, Requester, RequesterConfig, UpstashRequest, UpstashResponse } from "@http";
import * as core from "./../vector";

export type * from "@commands/types";
import { Dict } from "@commands/client/types";

export type { Requester, UpstashRequest, UpstashResponse };

/**
 * Connection credentials for upstash vector.
 * Get them from https://console.upstash.com/vector/<uuid>
 */
export type IndexConfigCloudflare = {
  /**
   * UPSTASH_VECTOR_REST_URL
   */
  url?: string;
  /**
   * UPSTASH_VECTOR_REST_TOKEN
   */
  token?: string;

  /**
   * The signal will allow aborting requests on the fly.
   * For more check: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal?: AbortSignal;
} & RequesterConfig;

/**
 * Serverless vector client for upstash.
 */
export class Index<TIndexMetadata extends Dict = Dict> extends core.Index<TIndexMetadata> {
  /**
   * Create a new vector client by providing the url and token
   *
   * @example
   * ```typescript
   * const index = new Index({
   *  url: "<UPSTASH_VECTOR_REST_URL>",
   *  token: "<UPSTASH_VECTOR_REST_TOKEN>",
   * });
   * ```
   * OR
   * This will automatically get environment variables from .env file
   * ```typescript
   * const index = new Index();
   * ```
   */
  constructor(config?: IndexConfigCloudflare) {
    const token =
      config?.token ??
      process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_TOKEN ??
      process.env.UPSTASH_VECTOR_REST_TOKEN;
    const url =
      config?.url ??
      process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL ??
      process.env.UPSTASH_VECTOR_REST_URL;

    if (!token) {
      throw new Error("UPSTASH_VECTOR_REST_TOKEN is missing!");
    }
    if (!url) {
      throw new Error("UPSTASH_VECTOR_REST_URL is missing!");
    }

    if (url.startsWith(" ") || url.endsWith(" ") || /\r|\n/.test(url)) {
      console.warn("The vector url contains whitespace or newline, which can cause errors!");
    }
    if (token.startsWith(" ") || token.endsWith(" ") || /\r|\n/.test(token)) {
      console.warn("The vector token contains whitespace or newline, which can cause errors!");
    }

    const client = new HttpClient({
      baseUrl: url,
      retry: config?.retry,
      headers: { authorization: `Bearer ${token}` },
      signal: config?.signal,
    });

    super(client);
  }

  /**
   * Create a new Upstash Vector instance from environment variables.
   *
   * Use this to automatically load connection secrets from your environment
   * variables. For instance when using the Vercel integration.
   *
   * This tries to load `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` from
   * your environment using `process.env`.
   */
  static fromEnv(
    env?: { UPSTASH_VECTOR_REST_URL: string; UPSTASH_VECTOR_REST_TOKEN: string },
    config?: Omit<IndexConfigCloudflare, "url" | "token">
  ): Index {
    // @ts-ignore These will be defined by cloudflare
    const url = env?.UPSTASH_VECTOR_REST_URL ?? UPSTASH_VECTOR_REST_URL;

    if (!url) {
      throw new Error(
        "Unable to find environment variable: `UPSTASH_VECTOR_REST_URL`. Please add it via `wrangler secret put UPSTASH_VECTOR_REST_URL`"
      );
    }

    // @ts-ignore These will be defined by cloudflare
    const token = env?.UPSTASH_VECTOR_REST_TOKEN ?? UPSTASH_VECTOR_REST_TOKEN;

    if (!token) {
      throw new Error(
        "Unable to find environment variable: `UPSTASH_VECTOR_REST_TOKEN`. Please add it via `wrangler secret put UPSTASH_VECTOR_REST_TOKEN`"
      );
    }
    return new Index({ ...config, url, token });
  }
}
