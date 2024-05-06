import { Command } from "@commands/command";
import type { NAMESPACE, Vector } from "@commands/client/types";

type FetchCommandOptions = {
  includeMetadata?: boolean;
  includeVectors?: boolean;
};

export type FetchResult<TMetadata = Record<string, unknown>> = Vector<TMetadata> | null;

type FetchEndpointVariants = `fetch` | `fetch/${NAMESPACE}`;

export class FetchCommand<TMetadata> extends Command<FetchResult<TMetadata>[]> {
  constructor(
    [ids, opts]: [ids: number[] | string[], opts?: FetchCommandOptions],
    options?: { namespace?: string }
  ) {
    let endpoint: FetchEndpointVariants = "fetch";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super({ ids, ...opts }, endpoint);
  }
}
