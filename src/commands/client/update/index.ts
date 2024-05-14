import type { NAMESPACE } from "@commands/client/types";
import { Command } from "@commands/command";

type NoInfer<T> = T extends infer U ? U : never;

type BasePayload = {
  id: number | string;
};

type ExtendedVectorPayload<TMetadata> = BasePayload &
  (
    | {
        metadata: NoInfer<TMetadata>;
        vector?: number[];
        data?: never;
      }
    | {
        metadata?: NoInfer<TMetadata>;
        vector: number[];
        data?: never;
      }
  );

type ExtendedDataPayload<TMetadata> = BasePayload &
  (
    | {
        metadata: NoInfer<TMetadata>;
        data: string;
        vector?: never;
      }
    | {
        metadata?: NoInfer<TMetadata>;
        data: string;
        vector?: never;
      }
  );

type Payload<TMetadata> =
  | ExtendedDataPayload<TMetadata>
  | ExtendedVectorPayload<TMetadata>
  | ExtendedDataPayload<TMetadata>[]
  | ExtendedVectorPayload<TMetadata>[];

type updateCommandOptions = { namespace?: string };

type updateEndpointVariants = `update` | `update/${NAMESPACE}`;

type UpdateCommandResponse = { updated: number };
export class UpdateCommand<TMetadata> extends Command<UpdateCommandResponse> {
  constructor(payload: Payload<TMetadata>, opts?: updateCommandOptions) {
    let endpoint: updateEndpointVariants = "update";

    if (opts?.namespace) {
      endpoint = `${endpoint}/${opts.namespace}`;
    }

    super(payload, endpoint);
  }
}
