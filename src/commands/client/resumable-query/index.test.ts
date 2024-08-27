import { afterAll, describe, expect, test } from "bun:test";

import { Index, awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";
import { sleep } from "bun";

describe("RESUMABLE QUERY", () => {
	const index = new Index();
	afterAll(async () => {
		await index.reset();
	});
	test("should start query successfully", async () => {
		const { start } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 50,
			vector: range(0, 384),
			includeMetadata: true,
			includeVectors: true,
		});

		const res = await start();

		expect(res.uuid).toBeDefined();
	});
	test("should stop query successfully", async () => {
		const { fetchNext, stop } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 50,
			vector: range(0, 384),
			includeMetadata: true,
			includeVectors: true,
		});

		const res = await stop();

		expect(res).toBe("Success");

		await expect(async () => {
			await fetchNext(5);
		}).toThrow("Resumable query has not been started. Call start() first.");
	});

	test("should resume query", async () => {
		await index.upsert([
			{
				id: 1,
				vector: range(0, 384),
				metadata: {
					animal: "elephant",
					tags: ["mammal"],
					diet: "herbivore",
				},
			},
			{
				id: 2,
				vector: range(0, 384),
				metadata: {
					animal: "tiger",
					tags: ["mammal"],
					diet: "carnivore",
				},
			},
		]);

		await awaitUntilIndexed(index);

		const { fetchNext, stop } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 2,
			vector: range(0, 384),
			includeMetadata: true,
			includeVectors: true,
		});

		const res1 = await fetchNext(1);
		const res2 = await fetchNext(1);

		expect(res1.length).toBe(1);
		expect(res2.length).toBe(1);

		expect(res1).not.toEqual(res2);
		await stop();
	});

	test("should start resumable query with data", async () => {
		await index.upsert([
			{
				id: 1,
				vector: range(0, 384),
				metadata: {
					animal: "elephant",
					tags: ["mammal"],
					diet: "herbivore",
				},
			},
			{
				id: 2,
				vector: range(0, 384),
				metadata: {
					animal: "tiger",
					tags: ["mammal"],
					diet: "carnivore",
				},
			},
		]);

		await awaitUntilIndexed(index);
		const { fetchNext } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 2,
			data: "testing it",
			includeMetadata: true,
			includeVectors: true,
		});

		const res = await fetchNext(1);

		expect(res.length).toBe(1);
	});
});
