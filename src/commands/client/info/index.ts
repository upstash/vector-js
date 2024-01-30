import { Command } from "@commands/command";

export type InfoResult = {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
};

export class InfoCommand extends Command<InfoResult> {
  constructor() {
    super([], "info");
  }
}
