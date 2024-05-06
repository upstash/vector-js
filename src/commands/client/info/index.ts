import { Command } from "@commands/command";
import { NAMESPACE } from "../types";

export type InfoResult = {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
  dimension: number;
  similarityFunction: "COSINE" | "EUCLIDEAN" | "DOT_PRODUCT";
};

type InfoEndpointVariants = `info` | `info/${NAMESPACE}`;

type InfoCommandOptions = { namespace?: string };

export class InfoCommand extends Command<InfoResult> {
  constructor(options?: InfoCommandOptions) {
    let endpoint: InfoEndpointVariants = "info";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super([], endpoint);
  }
}
