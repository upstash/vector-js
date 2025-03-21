import { HttpClient, type RequesterConfig } from "@http";
import * as core from "./../vector";

export type * from "@commands/types";
import type { Dict } from "@commands/client/types";
import { VERSION } from "../../version";

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
  signal?: AbortSignal;

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
  constructor(config?: IndexConfig) {
    const safeProcess = (typeof process === "undefined" ? {} : process) as Record<
      string,
      string | undefined
    >;
    const token =
      config?.token ??
      safeProcess.NEXT_PUBLIC_UPSTASH_VECTOR_REST_TOKEN ??
      safeProcess.UPSTASH_VECTOR_REST_TOKEN;
    const url =
      config?.url ??
      safeProcess.NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL ??
      safeProcess.UPSTASH_VECTOR_REST_URL;

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

    const enableTelemetry = safeProcess.UPSTASH_DISABLE_TELEMETRY
      ? false
      : (config?.enableTelemetry ?? true);

    const telemetryHeaders: Record<string, string> = enableTelemetry
      ? {
          "Upstash-Telemetry-Sdk": `upstash-vector-js@${VERSION}`,
          "Upstash-Telemetry-Platform": "cloudflare",
        }
      : {};

    const client = new HttpClient({
      baseUrl: url,
      retry: config?.retry,
      headers: { authorization: `Bearer ${token}`, ...telemetryHeaders },
      signal: config?.signal,
      cache: config?.cache === false ? undefined : config?.cache,
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
    let url: string | undefined;
    let token: string | undefined;

    // "env" is for the cloudflare environment
    if (env) {
      url = env.UPSTASH_VECTOR_REST_URL;
      if (!url) {
        throw new Error(
          "Unable to find environment variable: `UPSTASH_VECTOR_REST_URL`. Please add it via `wrangler secret put UPSTASH_VECTOR_REST_URL`"
        );
      }

      token = env.UPSTASH_VECTOR_REST_TOKEN;
      if (!token) {
        throw new Error(
          "Unable to find environment variable: `UPSTASH_VECTOR_REST_TOKEN`. Please add it via `wrangler secret put UPSTASH_VECTOR_REST_TOKEN`"
        );
      }
    }

    return new Index({
      // @ts-expect-error We don't need to type this in the cf env type
      enableTelemetry: env?.UPSTASH_DISABLE_TELEMETRY ? false : undefined,
      ...config,
      url,
      token,
    });
  }
}

export { type Requester, type UpstashRequest, type UpstashResponse } from "@http";
export { QueryMode, FusionAlgorithm, WeightingStrategy } from "@commands/client/query";
export { type SparseVector } from "@commands/client/types";
