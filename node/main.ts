import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { initMempool, insertUrls } from "./mempool.ts";
import "https://deno.land/std@0.181.0/dotenv/load.ts";

const port = 9090;

const handler = async (request: Request): Promise<Response> => {
  console.log(`${request.method} ${request.url}`);
  if (request.method != "POST") {
    const data = {
      executor: Deno.env.get("EXECUTOR_ADDRESS"),
      factory: Deno.env.get("FACTORY_ADDRESS"),
      rpc: Deno.env.get("RPC_URL"),
    };
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  }
  try {
    const data = JSON.parse(await request.text());

    if (data["url"] == undefined) {
      return new Response("Bad request", { status: 400 });
    }
    const url = data["url"] as string;
    insertUrls([url]);
  } catch (e) {
    return new Response("Bad request", { status: 400 });
  }
  return new Response(undefined, { status: 200 });
};

initMempool();
console.log(`HTTP webserver is running on http://localhost:${port}/`);
await serve(handler, { port });
