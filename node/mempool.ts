import { DB } from "https://deno.land/x/sqlite/mod.ts";


function getDB(test?: boolean) {
  const name = test == true ? "db/mempool_test.db" : "db/mempool.db";
  return new DB(name);
}

function createTable(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS mempool (
      url TEXT PRIMARY KEY
    )
  `);
}

export function insertUrls(urls: string[], test?: boolean) {
  const db = getDB(test);
  for (const url of urls) {
    try {
      db.query("INSERT INTO mempool VALUES (?)", [url]);
    } catch (e) {
      continue;
    }
  }
  db.close();
}

export function getUrls(test?: boolean) {
  const db = getDB(test);
  const query = db.query("SELECT url FROM mempool");
  db.close();
  return query;
}

export function dropTable() {
  const db = getDB(true);
  db.execute("DROP TABLE mempool");
  db.close();
}

export function initMempool(test?: boolean) {
  const db = getDB(test);
  createTable(db);
  db.close();
}