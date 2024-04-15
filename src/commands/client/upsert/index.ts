import { Command } from "@commands/command";

type NoInfer<T> = T extends infer U ? U : never;

type VectorPayload<TMetadata> = {
  id: number | string;
  vector: number[];
  metadata?: NoInfer<TMetadata>;
};
type DataPayload<TMetadata> = {
  id: number | string;
  data: string;
  metadata?: NoInfer<TMetadata>;
};

type PayloadArray<TMetadata> = VectorPayload<TMetadata>[] | DataPayload<TMetadata>[];

export class UpsertCommand<TMetadata> extends Command<string> {
  constructor(
    payload: VectorPayload<TMetadata> | DataPayload<TMetadata> | PayloadArray<TMetadata>
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
