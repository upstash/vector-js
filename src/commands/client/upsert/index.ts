import { Command } from "@commands/command";

type NoInfer<T> = T extends infer U ? U : never;

type UpsertCommandPayload<TMetadata> = {
  id: number | string;
  vector: number[];
  metadata?: NoInfer<TMetadata>;
};

export class UpsertCommand<TMetadata> extends Command<string> {
  constructor(payload: UpsertCommandPayload<TMetadata> | UpsertCommandPayload<TMetadata>[]) {
    super(payload, "upsert");
  }
}
