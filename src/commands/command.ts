import { UpstashError } from "@error/index";
import { Requester } from "@http";
import { NAMESPACE } from "./client/types";

const ENDPOINTS = [
  "upsert",
  "query",
  "delete",
  "fetch",
  "reset",
  "range",
  "info",
  "upsert-data",
  "query-data",
] as const;

export type EndpointVariants =
  | (typeof ENDPOINTS)[number]
  | `${(typeof ENDPOINTS)[number]}/${NAMESPACE}`;
/**
 * TResult is the raw data returned from upstash, which may need to be transformed or parsed.
 */
export class Command<TResult> {
  public readonly payload: Record<string, unknown> | unknown[];
  public readonly endpoint: EndpointVariants;

  constructor(command: Record<string, unknown> | unknown[], endpoint: EndpointVariants) {
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

    if (typeof result === "undefined") {
      throw new Error("Request did not return a result");
    }

    return result;
  }
}
