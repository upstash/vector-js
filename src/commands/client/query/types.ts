import type { Dict, NAMESPACE, RawSparseVector } from "../types";

export type QueryCommandPayload = {
  topK: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
  weightingStrategy?: WeightingStrategy;
  fusionAlgorithm?: FusionAlgorithm;
  queryMode?: QueryMode;
} & (
  | { vector?: number[]; sparseVector?: RawSparseVector; data?: never }
  | { data: string; vector?: never; sparseVector?: never }
);

export type QueryResult<TMetadata = Dict> = {
  id: number | string;
  score: number;
  vector?: number[];
  sparseVector?: RawSparseVector;
  metadata?: TMetadata;
  data?: string;
};

export type QueryCommandOptions = { namespace?: string };

export type QueryEndpointVariants =
  | `query`
  | `query-data`
  | `query/${NAMESPACE}`
  | `query-data/${NAMESPACE}`;

/**
 * For sparse vectors, what kind of weighting strategy
 * should be used while querying the matching non-zero
 * dimension values of the query vector with the documents.
 *
 * If not provided, no weighting will be used.
 */
export enum WeightingStrategy {
  /**
   * Inverse document frequency.
   *
   * It is recommended to use this weighting strategy for
   * BM25 sparse embedding models.
   *
   * It is calculated as
   *
   * ln(((N - n(q) + 0.5) / (n(q) + 0.5)) + 1) where
   * N:    Total number of sparse vectors.
   * n(q): Total number of sparse vectors having non-zero value
   *       for that particular dimension.
   * ln:   Natural logarithm
   *
   * The values of N and n(q) are maintained by Upstash as the
   * vectors are indexed.
   */
  IDF = "IDF",
}

/**
 * Fusion algorithm to use while fusing scores
 * from dense and sparse components of a hybrid index.
 *
 * If not provided, defaults to `RRF`.
 */
export enum FusionAlgorithm {
  /**
   * Reciprocal rank fusion.
   *
   * Each sorted score from the dense and sparse indexes are
   * mapped to 1 / (rank + K), where rank is the order of the
   * score in the dense or sparse scores and K is a constant
   * with the value of 60.
   *
   * Then, scores from the dense and sparse components are
   * deduplicated (i.e. if a score for the same vector is present
   * in both dense and sparse scores, the mapped scores are
   * added; otherwise individual mapped scores are used)
   * and the final result is returned as the topK values
   * of this final list.
   *
   * In short, this algorithm just takes the order of the scores
   * into consideration.
   */
  RRF = "RRF",

  /**
   * Distribution based score fusion.
   *
   * Each sorted score from the dense and sparse indexes are
   * normalized as
   * (s - (mean - 3 * stddev)) / ((mean + 3 * stddev) - (mean - 3 * stddev))
   * where s is the score, (mean - 3 * stddev) is the minimum,
   * and (mean + 3 * stddev) is the maximum tail ends of the distribution.
   *
   * Then, scores from the dense and sparse components are
   * deduplicated (i.e. if a score for the same vector is present
   * in both dense and sparse scores, the normalized scores are
   * added; otherwise individual normalized scores are used)
   * and the final result is returned as the topK values
   * of this final list.
   *
   * In short, this algorithm takes distribution of the scores
   * into consideration as well, as opposed to the `RRF`.
   */
  DBSF = "DBSF",
}

/**
 * Query mode for hybrid indexes with Upstash-hosted
 * embedding models.
 *
 * Specifies whether to run the query in only the
 * dense index, only the sparse index, or in both.
 *
 * If not provided, defaults to `HYBRID`.
 */
export enum QueryMode {
  /**
   * Runs the query in hybrid index mode, after embedding
   * the raw text data into dense and sparse vectors.
   *
   * Query results from the dense and sparse index components
   * of the hybrid index are fused before returning the result.
   */
  HYBRID = "HYBRID",

  /**
   * Runs the query in dense index mode, after embedding
   * the raw text data into a dense vector.
   *
   * Only the query results from the dense index component
   * of the hybrid index is returned.
   */
  DENSE = "DENSE",

  /**
   * Runs the query in sparse index mode, after embedding
   * the raw text data into a sparse vector.
   *
   * Only the query results from the sparse index component
   * of the hybrid index is returned.
   */
  SPARSE = "SPARSE",
}
