import {
  HttpClient,
  Requester,
  RequesterConfig,
  UpstashRequest,
  UpstashResponse,
} from "@http";
import * as core from "./src/vector";

export type { Requester, UpstashRequest, UpstashResponse };

/**
 * Connection credentials for upstash vector.
 * Get them from https://console.upstash.com/vector/<uuid>
 */
export type VectorConfig = {
  /**
   * UPSTASH_VECTOR_REST_URL
   */
  url: string;
  /**
   * UPSTASH_VECTOR_REST_TOKEN
   */
  token: string;

  /**
   * The signal will allow aborting requests on the fly.
   * For more check: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal?: AbortSignal;
} & RequesterConfig;

/**
 * Serverless vector client for upstash.
 */
export class Index extends core.Index {
  /**
   * Create a new vector client by providing the url and token
   *
   * @example
   * ```typescript
   * const vector = new Vector({
   *  url: "<UPSTASH_VECTOR_REST_URL>",
   *  token: "<UPSTASH_VECTOR_REST_TOKEN>",
   * });
   * ```
   */
  constructor(config: VectorConfig);

  /**
   * Create a new vector client by providing a custom `Requester` implementation
   *
   * @example
   * ```ts
   *
   * import { UpstashRequest, Requester, UpstashResponse, vector } from "@upstash/vector"
   *
   *  const requester: Requester = {
   *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
   *      // ...
   *    }
   *  }
   *
   * const vector = new vector(requester)
   * ```
   */
  constructor(requesters: Requester);
  constructor(configOrRequester: VectorConfig | Requester) {
    if ("request" in configOrRequester) {
      super(configOrRequester);
      return;
    }
    if (
      configOrRequester.url.startsWith(" ") ||
      configOrRequester.url.endsWith(" ") ||
      /\r|\n/.test(configOrRequester.url)
    ) {
      console.warn(
        "The vector url contains whitespace or newline, which can cause errors!"
      );
    }
    if (
      configOrRequester.token.startsWith(" ") ||
      configOrRequester.token.endsWith(" ") ||
      /\r|\n/.test(configOrRequester.token)
    ) {
      console.warn(
        "The vector token contains whitespace or newline, which can cause errors!"
      );
    }

    const client = new HttpClient({
      baseUrl: configOrRequester.url,
      retry: configOrRequester.retry,
      headers: { authorization: `Bearer ${configOrRequester.token}` },
      cache: configOrRequester.cache || "no-store",
      signal: configOrRequester.signal,
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
  static fromEnv(config?: Omit<VectorConfig, "url" | "token">): Index {
    const url = process?.env.UPSTASH_VECTOR_REST_URL;
    if (!url) {
      throw new Error(
        "Unable to find environment variable: `UPSTASH_VECTOR_REST_URL`"
      );
    }
    const token = process?.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!token) {
      throw new Error(
        "Unable to find environment variable: `UPSTASH_VECTOR_REST_TOKEN`"
      );
    }
    return new Index({ ...config, url, token });
  }
}
