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
 * Appends a namespace to an endpoint as a single path segment.
 *
 * The namespace is percent-encoded so that characters such as `?`, `#` and spaces stay part of
 * the namespace name. Names that can't be used as a namespace are rejected: `/`, `\` and `%` are
 * not allowed in namespace names, and `.` and `..` can't be represented as a path segment.
 */
export const withNamespace = <TEndpoint extends string>(
  endpoint: TEndpoint,
  namespace: string
): `${TEndpoint}/${string}` => {
  if (typeof namespace !== "string") {
    throw new UpstashError("Namespace must be a string.");
  }
  if (namespace === "." || namespace === "..") {
    throw new UpstashError('Namespace cannot be "." or "..".');
  }
  if (/[%/\\]/.test(namespace)) {
    throw new UpstashError(String.raw`Namespace cannot contain "/", "\" or "%".`);
  }
  return `${endpoint}/${encodeURIComponent(namespace)}`;
};
