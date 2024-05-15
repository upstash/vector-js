import type { NAMESPACE } from "@commands/client/types";
import { Command } from "@commands/command";

type NoInfer<T> = T extends infer U ? U : never;

type MetadataUpdatePayload<TMetadata> = {
  id: string | number;
  metadata: NoInfer<TMetadata>;
};

type VectorUpdatePayload = {
  id: string | number;
  vector: number[];
};

type DataUpdatePayload = {
  id: string | number;
  data: string;
};

type Payload<TMetadata> =
  | MetadataUpdatePayload<TMetadata>
  | VectorUpdatePayload
  | DataUpdatePayload
  | (MetadataUpdatePayload<TMetadata> | VectorUpdatePayload | DataUpdatePayload)[];

type UpdateCommandOptions = { namespace?: string };

type UpdateEndpointVariants = `update` | `update/${NAMESPACE}`;

type UpdateCommandResponse = { updated: number };
export class UpdateCommand<TMetadata> extends Command<UpdateCommandResponse> {
  constructor(payload: Payload<TMetadata>, opts?: UpdateCommandOptions) {
    let endpoint: UpdateEndpointVariants = "update";

    if (opts?.namespace) {
      endpoint = `${endpoint}/${opts.namespace}`;
    }

    super(payload, endpoint);
  }
}
