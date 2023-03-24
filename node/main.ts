import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { initMempool, insertUrls } from "./mempool.ts";

const port = 9090;

const handler = async (request: Request): Promise<Response> => {
  if (request.method != "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const data = await request.formData();
  if (data.get("url") == undefined) {
    return new Response("Bad request", { status: 400 });
  }
  const url = data.get("url") as string;
  insertUrls([url]);
  return new Response(undefined, { status: 200 });
};

initMempool();
console.log(`HTTP webserver is running on http://localhost:${port}/`);
await serve(handler, { port });
