export type Vector<TMetadata> = {
  id: string;
  vector: number[];
  metadata?: TMetadata;
};
