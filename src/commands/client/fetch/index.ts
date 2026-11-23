import type { NAMESPACE, Vector } from "@commands/client/types";
import type { Dict } from "@commands/client/types";
import { Command, withNamespace } from "@commands/command";

type FetchCommandOptions = {
  includeMetadata?: boolean;
  includeVectors?: boolean;
  includeData?: boolean;
  namespace?: string;
};

type IdsPayload = number[] | string[];

type ObjectPayload =
  | {
      /**
       * Ids of the items to be fetched.
       */
      ids: number[] | string[];
    }
  | {
      /**
       * Id prefix of the items to be fetched.
       */
      prefix: string;
    };

type FetchPayload = IdsPayload | ObjectPayload;

export type FetchResult<TMetadata = Dict> = Vector<TMetadata> | null;

type FetchEndpointVariants = `fetch` | `fetch/${NAMESPACE}`;

export class FetchCommand<TMetadata> extends Command<FetchResult<TMetadata>[]> {
  constructor([payload, opts]: [payload: FetchPayload, opts?: FetchCommandOptions]) {
    let endpoint: FetchEndpointVariants = "fetch";
    const { namespace, ...restOpts } = opts ?? {};

    if (namespace) {
      endpoint = withNamespace(endpoint, namespace);
    }

    if (Array.isArray(payload)) {
      super({ ids: payload, ...restOpts }, endpoint);
    } else if (typeof payload === "object") {
      super({ ...payload, ...restOpts }, endpoint);
    } else {
      throw new Error("Invalid payload");
    }
  }
}
