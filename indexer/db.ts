import { DB } from "https://deno.land/x/sqlite/mod.ts";
/**
/// event TxnCallSubmitted(bytes32 indexed txnHash, bytes4 indexed sig, bytes data);
/// event TxnCallExecuted(bytes32 indexed txnHash, bytes4 indexed sig, bytes data, bytes ret);
/// event LynxWalletCreateRequest(bytes32 sender, bytes handle, uint256 indexed vote, uint256 indexed block);
/// event LynxWalletCreated(address walletAddress, address indexed eoa, string indexed handle1, string indexed handle2, uint256 block);

 * event Transfer(address indexed from, address indexed to, uint256 indexed amount);
    event TwoFactorAuthMessageSubmitted(address indexed from, bytes32 indexed sender, uint256 indexed count, bytes32  data);
    event ExternalCall(
        address indexed from, address indexed to, uint256 indexed value, bytes callData, bytes ret
    );
 */

class IndexerDB {
  readonly db: DB;
  readonly txnCallSubmitted = "txn_call_submitted";
  readonly txnCallExecuted = "txn_call_executed";
  readonly lynxWalletCreateRequest = "lynx_wallet_create_request";
  readonly lynxWalletCreated = "lynx_wallet_created";
  readonly transfer = "transfer";
  readonly twoFactor = "two_factor_auth_message_submitted";
  readonly externalCall = "external_call";

  constructor() {
    this.db = new DB("db/indexer.db");
  }

  private createTxnCallSubmittedTable() {
    this.db.execute(`
    CREATE TABLE IF NOT EXISTS ${this.txnCallSubmitted} (
        txnHash TEXT PRIMARY KEY NOT NULL,
        sig TEXT NOT NULL,
        data TEXT NOT NULL
    )
    `);
  }

  private createTxnCallExecuted() {
    this.db.execute(`
    CREATE TABLE IF NOT EXISTS ${this.txnCallSubmitted} (
        txnHash TEXT PRIMARY KEY NOT NULL,
        sig TEXT NOT NULL,
        data TEXT NOT NULL,
        ret TEXT NOT NULL
    )
    `);
  }

  private createLynxWalletCreateRequest() {
    this.db.execute(`
        CREATE TABLE IF NOT EXISTS ${this.lynxWalletCreateRequest} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            handle TEXT NOT NULL,
            vote INTEGER,
            block INTEGER
        )
    `);
  }
}
