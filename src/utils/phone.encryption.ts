// src/utils/phone.encryption.ts
// Phone numbers are PII — encrypted at rest, never returned raw in API responses.
// Only decrypted internally when initiating a Twilio call.

import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // bytes for aes-256

function getKey(): Buffer {
  const raw = process.env.PHONE_ENCRYPTION_KEY;
  if (!raw) throw new Error("PHONE_ENCRYPTION_KEY is not set in environment");

  // Accept a 64-char hex string → 32 bytes, or derive from any string
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  // Derive a 32-byte key using SHA-256 if not hex
  return crypto.createHash("sha256").update(raw).digest();
}

/**
 * Encrypts a phone number for storage.
 * Returns a single string: iv:authTag:ciphertext (all hex encoded)
 */
export function encryptPhone(plainPhone: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainPhone, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts a stored phone number.
 * ONLY call this when actually initiating a Twilio call — never in list/detail API responses.
 */
export function decryptPhone(stored: string): string {
  const [ivHex, authTagHex, encryptedHex] = stored.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted phone format");
  }

  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Masks a phone number for display — e.g. +91 98765 43210 → +91 ***** 43210
 * Use this whenever you need to show agents that a number EXISTS without exposing it.
 */
export function maskPhone(plainPhone: string): string {
  if (plainPhone.length <= 4) return "****";
  const last4 = plainPhone.slice(-4);
  const masked = plainPhone.slice(0, -4).replace(/\d/g, "*");
  return masked + last4;
}