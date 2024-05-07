import { Command } from "@commands/command";


type NoInfer<T> = T extends infer U ? U : never;

type BasePayload = {
  id: number | string;
};

type ExtendedPayload<TMetadata> = BasePayload & ({
  metadata: NoInfer<TMetadata>;
  vector?: number[];
  data?: never;
} | {
  metadata?: NoInfer<TMetadata>;
  vector: number[];
  data?: never;
} | {
  metadata: NoInfer<TMetadata>;
  data: string;
  vector?: never;
} | {
  metadata?: NoInfer<TMetadata>;
  data: string;
  vector?: never;
});

type Payload<TMetadata> = ExtendedPayload<TMetadata>;

export class UpsertCommand<TMetadata> extends Command<string> {
  constructor(
    payload: Payload<TMetadata> | Payload<TMetadata>[],
  ) {
    let endpoint: "upsert" | "upsert-data" = "upsert";

    if (Array.isArray(payload)) {
      const hasData = payload.some((p) => "data" in p && p.data);
      if (hasData) {
        endpoint = "upsert-data";

        for (const p of payload) {
          if (!("metadata" in p) && "data" in p) {
            p.metadata = {
              data: p.data,
            } as NoInfer<TMetadata & { data: string }>;
          }
        }
      }
    } else {
      if ("data" in payload) {
        endpoint = "upsert-data";

        if (!("metadata" in payload)) {
          payload.metadata = {
            data: payload.data,
          } as NoInfer<TMetadata & { data: string }>;
        }
      }
    }

    super(payload, endpoint);
  }
}
