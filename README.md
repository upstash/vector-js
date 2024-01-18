# Upstash Vector Node.js Client

This is the official Node.js client for [Upstash](https://upstash.com/), written in TypeScript.

## Documentation

- [**Reference Documentation**](https://upstash.com/docs/vector/overall/getstarted)

## Installation

```
npm install @upstash/vector
pnpm add @upstash/vector
```

## Usage

### Initializing the client

There are two pieces of configuration required to use the Upstash vector client: an REST token and REST URL. These values can be passed using environment variables or in code through a configuration object. Find your configuration values in the console dashboard at [https://console.upstash.com/](https://console.upstash.com/).

#### Using environment variables

The environment variables used to configure the client are the following:

```bash
UPSTASH_VECTOR_REST_URL="your_rest_url"
UPSTASH_VECTOR_REST_TOKEN="your_rest_token"
```

When these environment variables are set, the client constructor does not require any additional arguments.

```typescript
import { fromEnv } from "@upstash/vector";

const index = new Index();
```

#### Using a configuration object

If you prefer to pass configuration in code, the constructor accepts a config object containing the `url` and `token` values. This
could be useful if your application needs to interact with multiple projects, each with a different configuration.

```typescript
import { Index } from "@upstash/vector";

const index = new Index({
  url: "<UPSTASH_VECTOR_REST_URL>",
  token: "<UPSTASH_VECTOR_REST_TOKEN>",
});
```

## Index operations

Upstash vector indexes support operations for working with vector data using operations such as upsert, query, fetch, and delete.

### Targeting an index

To perform data operations on an index, you target it using the `index` method.

```typescript
// Now perform index operations
await index.fetch([1, 2, 3], { includeMetadata: true, includeVectors: true });
```

### Targeting an index, with metadata typing

If you are storing metadata alongside your vector values, you can pass a type parameter to `index()` in order to get proper TypeScript typechecking.

```typescript
type Metadata = {
  title: string,
  genre: 'sci-fi' | 'fantasy' | 'horror' | 'action'
}

await index.upsert([{
  id: '1234',
  vector: [
    .... // embedding values
  ],
  metadata: {
    title: 'Lord of The Rings',
    genre: 'drama',
    category: 'classic'
  }
}])

const results = await index.query<Metadata>({
  vector: [
    ... // query embedding
  ],
  includeVectors: true,
  topK: 1,
})

if (results[0].metadata) {
  // Since we passed the Metadata type parameter above,
  // we can interact with metadata fields without having to
  // do any typecasting.
  const { title, genre, category } = movie.metadata;
  console.log(`The best match in fantasy was ${title}`)
}
```

### Upsert records

Upstash vector expects records inserted into indexes to have the following form:

```typescript
type UpstashRecord = {
  id: number | string;
  vector: number[];
  metadata?: Record<string, unknown>;
};
```

#### Upsert many

To upsert some records, you can use the client like so:

```typescript
// Prepare your data. The length of each array
// of vector values must match the dimension of
// the index where you plan to store them.
const records = [
  {
    id: "1",
    vector: [0.236, 0.971, 0.559],
  },
  {
    id: "2",
    vector: [0.685, 0.111, 0.857],
  },
];

// Upsert the data into your index
await index.upsert(records);
```

#### Upsert one

```typescript
// Prepare your data. The length of each array
// of vector values must match the dimension of
// the index where you plan to store them.
const record = {
  id: "1",
  vector: [0.236, 0.971, 0.559],
};
// Upsert the data into your index
await index.upsert(record);
```

### Querying

#### Querying with vector values

The query method accepts a large number of options. The dimension of the query vector must match the dimension of your index.

```typescript
type QueryOptions = {
  vector: number[];
  topK: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};
```

For example, to query by vector values you would pass the `vector` param in the options configuration. For brevity sake this example query vector is tiny (dimension 2), but in a more realistic use case this query vector would be an embedding outputted by a model. Look at the [Example code](#example-code) to see more realistic examples of how to use `query`.

```typescript
> await index.query({ topK: 3, vector: [ 0.22, 0.66 ]})
{
  matches: [
    {
      id: '6345',
      score: 1.00000012,
      vector: [],
      metadata: undefined
    },
    {
      id: '1233',
      score: 1.00000012,
      vector: [],
      metadata: undefined
    },
    {
      id: '4142',
      score: 1.00000012,
      vector: [],
      metadata: undefined
    }
  ],
  namespace: ''
}
```

You include options to `includeMetadata: true` or `includeVectors: true` if you need this information. By default these are not returned to keep the response payload small.

### Update a record

You may want to update vector `vector` or `metadata`. Specify the id and the attribute value you want to update.

```typescript
await index.upsert({
  id: "18593",
  metadata: { genre: "romance" },
});
```

### Fetch records by their IDs

```typescript
const fetchResult = await index.fetch(["id-1", "id-2"]);
```

### Delete records

For convenience there are several delete-related options. You can verify the results of a delete operation by trying to `fetch()` a record.

#### Delete one

```typescript
await index.delete("id-to-delete");
```

#### Delete many by id

```typescript
await index.delete(["id-1", "id-2", "id-3"]);
```

### Stats

To get statistics of your index, you can use the client like so:

```typescript
await index.stats(["id-1", "id-2", "id-3"]);
```

## Contributing

## Preparing the environment

This project uses [Bun](https://bun.sh/) for packaging and dependency management. Make sure you have the relevant dependencies.

You will also need a vector database on [Upstash](https://console.upstash.com/).

```commandline
curl -fsSL https://bun.sh/install | bash
```

## Code Formatting

```bash
bun run fmt
```

## Running tests

To run all the tests, make sure you have the relevant environment variables.

```bash
bun run test
```
