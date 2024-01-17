export type Vector<TMetadata = Record<string, unknown>> = {
  id: string;
  vector: number[];
  metadata?: TMetadata;
};
