export function getRuntime() {
  if (typeof process === "object" && typeof process.versions == "object" && process.versions.bun)
    return `bun@${process.versions.bun}`;

  // @ts-expect-error Silence compiler
  return typeof EdgeRuntime === "string" ? "edge-light" : `node@${process.version}`;
}
