import type { NAMESPACE, Vector } from "@commands/client/types";
import type { Dict } from "@commands/client/types";
import { Command } from "@commands/command";

type FetchCommandOptions = {
  includeMetadata?: boolean;
  includeVectors?: boolean;
  includeData?: boolean;
  namespace?: string;
};

export type FetchResult<TMetadata = Dict> = Vector<TMetadata> | null;

type FetchEndpointVariants = `fetch` | `fetch/${NAMESPACE}`;

export class FetchCommand<TMetadata> extends Command<FetchResult<TMetadata>[]> {
  constructor([ids, opts]: [ids: number[] | string[], opts?: FetchCommandOptions]) {
    let endpoint: FetchEndpointVariants = "fetch";

    if (opts?.namespace) {
      endpoint = `${endpoint}/${opts.namespace}`;
      delete opts.namespace;
    }

    super({ ids, ...opts }, endpoint);
  }
}
