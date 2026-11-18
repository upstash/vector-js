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
    const invalidAt = this.endpoint.indexOf(INVALID_NAMESPACE);
    if (invalidAt !== -1) {
      throw new UpstashError(this.endpoint.slice(invalidAt + INVALID_NAMESPACE.length));
    }

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

// Marks an endpoint whose namespace is not usable. The message after the marker is thrown when
// the command is executed, so that the error reaches the caller as a rejected promise. The marker
// can't be part of an accepted namespace since control characters are not allowed in one.
const INVALID_NAMESPACE = "\u0000invalid-namespace:";

// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTER = /[\u0000-\u001F\u007F]/;

const namespaceError = (namespace: unknown): string | undefined => {
  if (typeof namespace !== "string") {
    return "Namespace must be a string.";
  }
  if (namespace === "." || namespace === "..") {
    return 'Namespace cannot be "." or "..".';
  }
  if (CONTROL_CHARACTER.test(namespace)) {
    return "Namespace cannot contain control characters such as tab or new line.";
  }
  if (/[/\\]/.test(namespace)) {
    return String.raw`Namespace cannot contain "/" or "\".`;
  }
  if (namespace.includes("%")) {
    return 'Namespace cannot contain "%". Pass the namespace name as it is, without percent-encoding it.';
  }
  return undefined;
};

/**
 * Appends a namespace to an endpoint as a single path segment.
 *
 * The namespace is percent-encoded so that characters such as `?`, `#` and spaces stay part of
 * the namespace name. Numbers are converted to strings. Names that can't be used as a namespace
 * are not sent: `/`, `\`, `%` and control characters are not allowed in namespace names, and `.`
 * and `..` can't be represented as a path segment. For these the command fails when executed.
 */
export const withNamespace = <TEndpoint extends string>(
  endpoint: TEndpoint,
  namespace: string | number
): `${TEndpoint}/${string}` => {
  const input: unknown = namespace;
  const name = typeof input === "number" || typeof input === "bigint" ? String(input) : input;
  const error = namespaceError(name);
  if (error !== undefined) {
    return `${endpoint}/${INVALID_NAMESPACE}${error}`;
  }
  return `${endpoint}/${encodeURIComponent(name as string)}`;
};
