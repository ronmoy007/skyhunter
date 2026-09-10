import {
  pendingGet,
  pendingUpsert,
  pendingDelete,
  pendingIncrement,
  type Pending,
} from "./store";

// Verification-code lifetimes. Storage is handled by the adapter (store.ts).
export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_ATTEMPTS = 5;

export type { Pending };

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const upsertPending = (record: Pending) => pendingUpsert(record);
export const getPending = (email: string) => pendingGet(email);
export const deletePending = (email: string) => pendingDelete(email);
export const incrementAttempts = (email: string) => pendingIncrement(email);
