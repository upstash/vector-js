import { test, expect, } from "bun:test";
import { DATA, ID } from "./src/app/constants"

const deploymentURL = process.env.DEPLOYMENT_URL ?? "http://127.0.0.1:3000";
if (!deploymentURL) {
  throw new Error("DEPLOYMENT_URL not set");
}

test("the server is running", async () => {
  const res = await fetch(`${deploymentURL}/api`);  

  if (res.status !== 200) {
    console.log(await res.text());
  }

  expect(res.status).toEqual(200);
  const payload = await res.json() as { data: string, id: string }
  expect(payload.id).toBe(ID)
  expect(payload.data).toBe(DATA)

}, { timeout: 10000 });

test("pages router is working", async () => {
  const res = await fetch(`${deploymentURL}/api/pages-test`);

  if (res.status !== 200) {
    console.log(await res.text());
  }

  expect(res.status).toEqual(200);
})

