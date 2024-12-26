import type { NAMESPACE, SparseVector } from "@commands/client/types";
import { Command } from "@commands/command";
import { UpstashError } from "@error/index";

type NoInfer<T> = T extends infer U ? U : never;

type MetadataUpdatePayload<TMetadata> = {
  id: string | number;
  metadata: NoInfer<TMetadata>;
  metadataUpdateMode?: "PATCH" | "OVERWRITE";
};

type VectorUpdatePayload = {
  id: string | number;
  vector?: number[];
  sparseVector?: SparseVector;
};

type DataUpdatePayload = {
  id: string | number;
  data: string;
};

type Payload<TMetadata> =
  | MetadataUpdatePayload<TMetadata>
  | VectorUpdatePayload
  | DataUpdatePayload;

type UpdateCommandOptions = { namespace?: string };

type UpdateEndpointVariants = `update` | `update/${NAMESPACE}`;

type UpdateCommandResponse = { updated: number };
export class UpdateCommand<TMetadata> extends Command<UpdateCommandResponse> {
  constructor(payload: Payload<TMetadata>, opts?: UpdateCommandOptions) {
    let endpoint: UpdateEndpointVariants = "update";

    if (
      !("metadata" in payload) &&
      !("vector" in payload) &&
      !("sparseVector" in payload) &&
      !("data" in payload)
    ) {
      throw new UpstashError(
        `Error while updating vector with id ${payload.id}.` +
          `At least one of 'metadata', 'vector', 'sparseVector' or 'data' should be provided.`
      );
    }

    if (opts?.namespace) {
      endpoint = `${endpoint}/${opts.namespace}`;
    }

    super(payload, endpoint);
  }
}
