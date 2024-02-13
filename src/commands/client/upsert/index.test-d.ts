import { NonArrayType } from "@utils/test-utils";
import { expectTypeOf, test } from "vitest";
import { Index } from "../../../../index";

type Metadata = { genre: string; year: number };

test("case 1: no metadata is provided, any object should be expected", () => {
  const index = new Index();

  // ideally we would not have to pass the same generic again but infer from the index signature
  type ExpectedParameters = Parameters<typeof index.upsert>["0"];
  type ExpectedMetadata = NonNullable<NonArrayType<ExpectedParameters>["metadata"]>;

  expectTypeOf<ExpectedMetadata>().toEqualTypeOf<Record<string, unknown>>();
});

test("case 2: index-level metadata is provided, index-level metadata should be expected", () => {
  const index = new Index<Metadata>();

  // ideally we would not have to pass the same generic again but infer from the index signature instead
  type ExpectedParameters = Parameters<typeof index.upsert<Metadata>>["0"];
  type ExpectedMetadata = NonNullable<NonArrayType<ExpectedParameters>["metadata"]>;

  expectTypeOf<ExpectedMetadata>().toEqualTypeOf<Metadata>();
});

test("case 3: index-level metadata is provided and command-level metadata is provided, command-level metadata should be expected", () => {
  const index = new Index<Metadata>();

  type OverrideMetadata = { director: string };

  type ExpectedParameters = Parameters<typeof index.upsert<OverrideMetadata>>["0"];
  type ExpectedMetadata = NonNullable<NonNullable<NonArrayType<ExpectedParameters>>["metadata"]>;

  expectTypeOf<ExpectedMetadata>().toEqualTypeOf<OverrideMetadata>();
});

test("case 4: command-level metadata is provided, command-level metadata should be expected", () => {
  const index = new Index();

  type ExpectedParameters = Parameters<typeof index.upsert<Metadata>>["0"];

  type ExpectedMetadata = NonNullable<NonNullable<NonArrayType<ExpectedParameters>>["metadata"]>;

  expectTypeOf<ExpectedMetadata>().toEqualTypeOf<Metadata>();
});
