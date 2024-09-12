import type { Dict, NAMESPACE } from "../types";

export type QueryCommandPayload = {
  topK: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
} & ({ vector: number[]; data?: never } | { data: string; vector?: never });

export type QueryResult<TMetadata = Dict> = {
  id: number | string;
  score: number;
  vector?: number[];
  metadata?: TMetadata;
  data?: string;
};

export type QueryCommandOptions = { namespace?: string };

export type QueryEndpointVariants =
  | `query`
  | `query-data`
  | `query/${NAMESPACE}`
  | `query-data/${NAMESPACE}`;
