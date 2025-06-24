import type { HttpClientConfig } from "@http";
import { HttpClient, type Requester, type RequesterConfig } from "@http";
import * as core from "./../vector";
import type { Dict } from "@commands/client/types";
import { VERSION } from "../../version";
import { getRuntime } from "@utils/get-runtime";

export type * from "@commands/types";

/**
 * Connection credentials for upstash vector.
 * Get them from https://console.upstash.com/vector/<uuid>
 */
export type IndexConfig = {
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
  signal?: HttpClientConfig["signal"];

  /**
   * Enable telemetry to help us improve the SDK.
   * The sdk will send the sdk version, platform and node version as telemetry headers.
   *
   * @default true
   */
  enableTelemetry?: boolean;
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
  constructor(config?: IndexConfig);

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
  constructor(requesters?: Requester);
  constructor(configOrRequester?: IndexConfig | Requester) {
    if (configOrRequester !== undefined && "request" in configOrRequester) {
      super(configOrRequester);
      return;
    }
    const token =
      configOrRequester?.token ??
      process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_TOKEN ??
      process.env.UPSTASH_VECTOR_REST_TOKEN;
    const url =
      configOrRequester?.url ??
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

    const enableTelemetry = process.env.UPSTASH_DISABLE_TELEMETRY
      ? false
      : (configOrRequester?.enableTelemetry ?? true);

    const telemetryHeaders: Record<string, string> = enableTelemetry
      ? {
          "Upstash-Telemetry-Sdk": `upstash-vector-js@${VERSION}`,
          "Upstash-Telemetry-Platform": process.env.VERCEL
            ? "vercel"
            : process.env.AWS_REGION
              ? "aws"
              : "unknown",
          "Upstash-Telemetry-Runtime": getRuntime(),
        }
      : {};

    const client = new HttpClient({
      baseUrl: url,
      retry: configOrRequester?.retry,
      headers: { authorization: `Bearer ${token}`, ...telemetryHeaders },
      cache:
        configOrRequester?.cache === false ? undefined : configOrRequester?.cache || "no-store",
      signal: configOrRequester?.signal,
    });

    super(client);
  }

  /**
   * Create a new Upstash Vector instance from environment variables.
   *
   * Use this to automatically load connection secrets from your environment
   * variables. For instance when using the Vercel integration.
   *
   * When used on the Cloudflare Workers, you can just pass the "env" context provided by Cloudflare.
   * Else, this tries to load `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` from
   * your environment using `process.env`.
   */
  static fromEnv(
    env?: { UPSTASH_VECTOR_REST_URL: string; UPSTASH_VECTOR_REST_TOKEN: string },
    config?: Omit<IndexConfig, "url" | "token">
  ): Index {
    const url = env?.UPSTASH_VECTOR_REST_URL || process?.env.UPSTASH_VECTOR_REST_URL;
    const token = env?.UPSTASH_VECTOR_REST_TOKEN || process?.env.UPSTASH_VECTOR_REST_TOKEN;

    if (!url) {
      throw new Error("Unable to find environment variable: `UPSTASH_VECTOR_REST_URL`");
    }

    if (!token) {
      throw new Error("Unable to find environment variable: `UPSTASH_VECTOR_REST_TOKEN`");
    }

    return new Index({ ...config, url, token });
  }
}

export { type UpstashRequest, type UpstashResponse, type Requester } from "@http";
export { QueryMode, FusionAlgorithm, WeightingStrategy } from "@commands/client/query";
export { type SparseVector } from "@commands/client/types";
