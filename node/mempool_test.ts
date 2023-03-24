import { assertEquals } from "https://deno.land/std@0.180.0/testing/asserts.ts";
import { insertUrls, initMempool, getUrls, dropTable } from "./mempool.ts";

Deno.test(
  {
    name: "Test insert data",
    permissions: { read: true, write: true },
  },
  () => {
    initMempool(true);
    const urls = [
      "https://twitter.com/news24tvchannel/status/1639103806838562819",
      "https://twitter.com/PremSanataniHB/status/1639155398736494594",
    ];

    insertUrls(urls, true);
    const fetched = getUrls(true);
    assertEquals(fetched.length, urls.length);
    assertEquals(
      fetched.map((value) => value[0]),
      urls
    );
    dropTable();
  }
);
