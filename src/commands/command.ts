import type { Dict } from "@commands/client/types";
import { UpstashError } from "@error/index";
import type { Requester } from "@http";
import type { NAMESPACE } from "./client/types";

const _ENDPOINTS = [
  "upsert",
  "update",
  "query",
  "delete",
  "fetch",
  "reset",
  "range",
  "info",
  "resumable-query",
  "resumable-query-data",
  "resumable-query-next",
  "resumable-query-end",
  "upsert-data",
  "query-data",
  "list-namespaces",
  "delete-namespace",
] as const;

export type EndpointVariants =
  | (typeof _ENDPOINTS)[number]
  | `${(typeof _ENDPOINTS)[number]}/${NAMESPACE}`
  | `reset?all`; // here to make sure that reset?all/<namespace> is invalid

/**
 * TResult is the raw data returned from upstash, which may need to be transformed or parsed.
 */
export class Command<TResult> {
  public readonly payload: Dict | unknown[];
  public readonly endpoint: EndpointVariants;

  constructor(command: Dict | unknown[], endpoint: EndpointVariants) {
    this.payload = command;
    this.endpoint = endpoint;
  }

  /**
   * Execute the command using a client.
   */
  public async exec(client: Requester): Promise<TResult> {
    const { result, error } = await client.request<TResult>({
      body: this.payload,
      path: [this.endpoint],
    });

    if (error) {
      throw new UpstashError(error);
    }

    if (result === undefined) {
      throw new TypeError("Request did not return a result");
    }

    return result;
  }
}

/**
 * Appends a namespace to an endpoint.
 *
 * The namespace is sent as it is, so it has to fit in a single path segment. Names containing
 * `/`, `\`, `?` or `#` would change which endpoint the request is sent to, and `.` and `..` are
 * resolved by URL parsers (also in their percent-encoded forms), so these are not accepted.
 */
export const withNamespace = <TEndpoint extends string>(
  endpoint: TEndpoint,
  namespace: string
): `${TEndpoint}/${string}` => {
  if (typeof namespace !== "string") {
    throw new UpstashError("Namespace must be a string.");
  }
  if (/[#/?\\]/.test(namespace)) {
    throw new UpstashError(String.raw`Namespace cannot contain "/", "\", "?" or "#".`);
  }
  // URL parsers drop whitespace and control characters around a segment and read %2e as a dot
  const segment = [...namespace]
    .filter((char) => char > " ")
    .join("")
    .replaceAll(/%2e/gi, ".");
  if (segment === "." || segment === "..") {
    throw new UpstashError('Namespace cannot be "." or "..".');
  }
  return `${endpoint}/${namespace}`;
};
