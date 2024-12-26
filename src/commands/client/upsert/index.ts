import type { NAMESPACE, RawSparseVector } from "@commands/client/types";
import { Command } from "@commands/command";

type NoInfer<T> = T extends infer U ? U : never;

type VectorPayload<TMetadata> = {
  id: number | string;
  vector?: number[];
  sparseVector?: RawSparseVector;
  metadata?: NoInfer<TMetadata>;
};

type DataPayload<TMetadata> = {
  id: number | string;
  data: string;
  metadata?: NoInfer<TMetadata>;
};

type Payload<TMetadata> =
  | VectorPayload<TMetadata>
  | DataPayload<TMetadata>
  | VectorPayload<TMetadata>[]
  | DataPayload<TMetadata>[];

type UpsertCommandOptions = { namespace?: string };

type UpsertEndpointVariants =
  | `upsert`
  | `upsert-data`
  | `upsert/${NAMESPACE}`
  | `upsert-data/${NAMESPACE}`;

export class UpsertCommand<TMetadata> extends Command<string> {
  constructor(payload: Payload<TMetadata>, opts?: UpsertCommandOptions) {
    let endpoint: UpsertEndpointVariants = "upsert";

    if (Array.isArray(payload)) {
      const isUpsert = payload.some((p) => isVectorPayload(p));
      endpoint = isUpsert ? "upsert" : "upsert-data";
    } else {
      endpoint = isVectorPayload(payload) ? "upsert" : "upsert-data";
    }

    if (opts?.namespace) {
      endpoint = `${endpoint}/${opts.namespace}`;
    }
    super(payload, endpoint);
  }
}

const isVectorPayload = <TMetadata>(
  payload: VectorPayload<TMetadata> | DataPayload<TMetadata>
): payload is VectorPayload<TMetadata> => {
  // TODO: fix field name
  return "vector" in payload || "sparseVector" in payload;
};
