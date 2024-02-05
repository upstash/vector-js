import { Command } from "@commands/command";

type UpsertCommandPayload<TMetadata> = {
  id: number | string;
  vector: number[];
  metadata?: TMetadata;
};

export class UpsertCommand<TMetadata> extends Command<string> {
  constructor(payload: UpsertCommandPayload<TMetadata> | UpsertCommandPayload<TMetadata>[]) {
    super(payload, "upsert");
  }
}
