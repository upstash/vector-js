import { Command } from "@commands/command";

export type StatsResult = {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
};

export class StatsCommand extends Command<StatsResult> {
  constructor() {
    super([], "stats");
  }
}
