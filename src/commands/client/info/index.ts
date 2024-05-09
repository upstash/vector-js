import { Command } from "@commands/command";

type NamespaceTitle = string;
type NamespaceInfo = {
  vectorCount: number;
  pendingVectorCount: number;
};

export type InfoResult = {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
  dimension: number;
  similarityFunction: "COSINE" | "EUCLIDEAN" | "DOT_PRODUCT";
  namespaces: Record<NamespaceTitle, NamespaceInfo>;
};

type InfoEndpointVariants = `info`;

export class InfoCommand extends Command<InfoResult> {
  constructor() {
    const endpoint: InfoEndpointVariants = "info";

    super([], endpoint);
  }
}
