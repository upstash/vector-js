import { Command } from "@commands/command";

type NamespaceTitle = string;
type SimilarityFunction = "COSINE" | "EUCLIDEAN" | "DOT_PRODUCT";
type NamespaceInfo = {
  vectorCount: number;
  pendingVectorCount: number;
};

type DenseIndexInfo = {
  dimension: number;
  similarityFunction: SimilarityFunction;
  embeddingModel: string;
}

type SparseIndexInfo = {
  embeddingModel: string;
}

export type InfoResult = {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
  dimension: number;
  similarityFunction: SimilarityFunction;
  denseIndex?: DenseIndexInfo;
  sparseIndex?: SparseIndexInfo;
  namespaces: Record<NamespaceTitle, NamespaceInfo>;
};

type InfoEndpointVariants = `info`;

export class InfoCommand extends Command<InfoResult> {
  constructor() {
    const endpoint: InfoEndpointVariants = "info";

    super([], endpoint);
  }
}
