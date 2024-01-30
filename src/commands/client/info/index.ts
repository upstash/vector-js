import { Command } from "@commands/command";

export type InfoResult = {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
  dimension: number;
  similarityFunction: "COSINE" | "EUCLIDEAN" | "DOT_PRODUCT";
};

export class InfoCommand extends Command<InfoResult> {
  constructor() {
    super([], "info");
  }
}
