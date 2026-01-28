import crypto from "crypto";

const HASH_ALGO = "sha256";

export function hashValue(value: string): string {
  return crypto
    .createHash(HASH_ALGO)
    .update(value)
    .digest("hex");
}

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
