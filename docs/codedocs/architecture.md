---
title: "Architecture"
description: "Understand the internal module structure, command flow, and key design decisions."
---

This SDK is structured around a small core `Index` class, a set of command objects that map to REST endpoints, and platform-specific entrypoints that configure HTTP behavior and telemetry.

```mermaid
graph TD
  A[platforms/nodejs.ts] --> B[Index wrapper]
  C[platforms/cloudflare.ts] --> B
  B --> D[core Index (src/vector.ts)]
  D --> E[Command subclasses]
  E --> F[Command.exec]
  F --> G[Requester]
  G --> H[HttpClient]
  H --> I[fetch + retries]
  E --> J[UpstashError]
```

**How the pieces fit together**
- The platform entrypoints (`src/platforms/nodejs.ts`, `src/platforms/cloudflare.ts`) validate credentials, assemble headers, and construct `HttpClient`.
- `HttpClient` implements the `Requester` interface, handles retries, and serializes requests as JSON POSTs.
- The core `Index` class (`src/vector.ts`) exposes the public methods and instantiates command objects.
- Each command subclasses `Command<TResult>` (`src/commands/command.ts`) and maps payloads to an endpoint string.
- The base `Command.exec` method calls the requester and normalizes errors into `UpstashError`.

```ts src/commands/command.ts
public async exec(client: Requester): Promise<TResult> {
  const { result, error } = await client.request<TResult>({
    body: this.payload,
    path: [this.endpoint],
  });

  if (error) {
    throw new UpstashError(error);
  }

  if (result === undefined) {
    throw new TypeError("Request did not return a result");
  }

  return result;
}
```

**Key design decisions**
- **HTTP-first transport**: All operations are REST calls over `fetch`. This allows the same client to run in serverless, edge, and browser-like environments without long-lived TCP sockets.
- **Command pattern**: Each API endpoint has a dedicated command class, which centralizes payload validation and endpoint selection. This keeps the `Index` surface small and predictable.
- **Platform split**: Node.js and Cloudflare entrypoints are separate to handle runtime-specific environment access and telemetry headers. The rest of the SDK is shared.
- **Typed payload unions**: Commands such as `UpsertCommand` and `QueryCommand` use discriminated unions to enforce valid combinations of `vector`, `sparseVector`, and `data`.
- **Telemetry opt-out**: Telemetry headers are enabled by default but can be disabled with `UPSTASH_DISABLE_TELEMETRY` or the `enableTelemetry` option.

**Data flow at runtime**
- A user calls `index.query`, `index.upsert`, or similar.
- The method constructs a command object with payload and namespace.
- `Command.exec` calls the configured `Requester` (usually `HttpClient`).
- `HttpClient` POSTs to the REST API and retries on network errors.
- The result is parsed and returned to the caller or throws `UpstashError`.

If you want to see how this maps to developer workflows, start with [Index and Namespaces](./index-and-namespaces) and then review the [API Reference](./api-reference/index).
