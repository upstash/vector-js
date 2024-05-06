import { UpstashError } from "@error/index";

type CacheSetting =
  | "default"
  | "force-cache"
  | "no-cache"
  | "no-store"
  | "only-if-cached"
  | "reload"
  | false;

export type UpstashRequest = {
  path?: string[];
  /**
   * Request body will be serialized to json
   */
  body?: unknown;
};
export type UpstashResponse<TResult> = {
  result?: TResult;
  error?: string;
};

export interface Requester {
  request: <TResult = unknown>(req: UpstashRequest) => Promise<UpstashResponse<TResult>>;
}

export type RetryConfig =
  | false
  | {
      /**
       * The number of retries to attempt before giving up.
       *
       * @default 5
       */
      retries?: number;
      /**
       * A backoff function receives the current retry cound and returns a number in milliseconds to wait before retrying.
       *
       * @default
       * ```ts
       * Math.exp(retryCount) * 50
       * ```
       */
      backoff?: (retryCount: number) => number;
    };

export type RequesterConfig = {
  /**
   * Configure the retry behaviour in case of network errors
   */
  retry?: RetryConfig;

  /**
   * Configure the cache behaviour
   * @default "no-store"
   */
  cache?: CacheSetting;
};

export type HttpClientConfig = {
  headers?: Record<string, string>;
  baseUrl: string;
  retry?: RetryConfig;
  signal?: AbortSignal;
} & RequesterConfig;

export class HttpClient implements Requester {
  public baseUrl: string;
  public headers: Record<string, string>;
  public readonly options: {
    signal?: AbortSignal;
    cache?: CacheSetting;
  };

  public readonly retry: {
    attempts: number;
    backoff: (retryCount: number) => number;
  };

  public constructor(config: HttpClientConfig) {
    this.options = {
      cache: config.cache,
      signal: config.signal,
    };

    this.baseUrl = config.baseUrl.replace(/\/$/, "");

    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    if (typeof config?.retry === "boolean" && config?.retry === false) {
      this.retry = {
        attempts: 1,
        backoff: () => 0,
      };
    } else {
      this.retry = {
        attempts: config?.retry?.retries ?? 5,
        backoff: config?.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50),
      };
    }
  }

  public async request<TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> {
    const requestOptions = {
      cache: this.options.cache,
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(req.body),
      keepalive: true,
      signal: this.options.signal,
    };

    let res: Response | null = null;
    let error: Error | null = null;
    for (let i = 0; i <= this.retry.attempts; i++) {
      try {
        res = await fetch([this.baseUrl, ...(req.path ?? [])].join("/"), requestOptions);
        break;
      } catch (err) {
        if (this.options.signal?.aborted) {
          const myBlob = new Blob([
            JSON.stringify({ result: this.options.signal.reason ?? "Aborted" }),
          ]);
          const myOptions = {
            status: 200,
            statusText: this.options.signal.reason ?? "Aborted",
          };
          res = new Response(myBlob, myOptions);
          break;
        }
        error = err as Error;
        await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
      }
    }
    if (!res) {
      throw error ?? new Error("Exhausted all retries");
    }

    // console.log(res.json());
    const body = (await res.json()) as UpstashResponse<TResult>;
    if (!res.ok) {
      throw new UpstashError(`${body.error}`);
    }

    return { result: body.result, error: body.error };
  }
}
