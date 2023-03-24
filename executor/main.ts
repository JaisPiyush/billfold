import { decode } from "https://deno.land/std@0.180.0/encoding/base64.ts";
import "https://deno.land/std@0.181.0/dotenv/load.ts";
import { factories } from "../abi/index.ts";

export async function fetchTxns(): Promise<string | undefined> {
  const cmd = Deno.run({
    cmd: ["python3", "scraper/main.py"],
    stderr: "piped",
    stdout: "piped",
  });

  const status = await cmd.status();
  if (!status.success) {
    return;
  }

  const output = new TextDecoder().decode(await cmd.output());
  cmd.close();
  return output;
}

function getDecodedData(data: string): string {
  const decodedBinary = decode(data);
  return new TextDecoder().decode(decodedBinary);
}
