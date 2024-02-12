import { Index } from "../../../../index";
import { TypeEqual, expectType, test } from "../utils.test-d";

type Metadata = { genre: string; year: number };

test("case 1: no metadata is provided, any object should be expected", () => {
  const index = new Index();

  type RetrievedRangeVector = Awaited<ReturnType<typeof index.range>>["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectType<TypeEqual<RetrievedMetadata, Record<string, unknown>>>(true);
});

test("case 2: index-level metadata is provided, index-level metadata should be expected", () => {
  const index = new Index<Metadata>();

  type RetrievedRangeVector = Awaited<ReturnType<typeof index.range<Metadata>>>["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectType<TypeEqual<RetrievedMetadata, Metadata>>(true);
});

test("case 3: index-level and command-level metadata are provided, command-level metadata should be expected", () => {
  const index = new Index<Metadata>();

  type OverrideMetadata = { director: string };

  type RetrievedRangeVector = Awaited<
    ReturnType<typeof index.range<OverrideMetadata>>
  >["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectType<TypeEqual<RetrievedMetadata, Metadata>>(false);
  expectType<TypeEqual<RetrievedMetadata, OverrideMetadata>>(true);
});

test("case 4: command-level metadata is provided, command-level metadata should be expected", () => {
  const index = new Index();

  type RetrievedRangeVector = Awaited<ReturnType<typeof index.range<Metadata>>>["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectType<TypeEqual<RetrievedMetadata, Metadata>>(true);
});
