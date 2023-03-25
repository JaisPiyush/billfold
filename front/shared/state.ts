import { signal } from "@preact/signals";
import { LynxWalletHandler } from "./comm.ts";

export const addressState = signal<string | undefined>(undefined);
export const lynxWalletHandler = signal<LynxWalletHandler | undefined>(
  undefined
);
