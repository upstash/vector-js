import { Command } from "@commands/command";

type UpsertCommandPayload = {
  id: number | string;
  vector: number[];
  metadata?: Record<string, unknown>;
};

export class UpsertCommand extends Command<string> {
  constructor(payload: UpsertCommandPayload | UpsertCommandPayload[]) {
    super(payload, "upsert");
  }
}
