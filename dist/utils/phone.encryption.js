"use strict";
// src/utils/phone.encryption.ts
// Phone numbers are PII — encrypted at rest, never returned raw in API responses.
// Only decrypted internally when initiating a Twilio call.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPhone = encryptPhone;
exports.decryptPhone = decryptPhone;
exports.maskPhone = maskPhone;
const crypto = __importStar(require("crypto"));
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // bytes for aes-256
function getKey() {
    const raw = process.env.PHONE_ENCRYPTION_KEY;
    if (!raw)
        throw new Error("PHONE_ENCRYPTION_KEY is not set in environment");
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
function encryptPhone(plainPhone) {
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
function decryptPhone(stored) {
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
function maskPhone(plainPhone) {
    if (plainPhone.length <= 4)
        return "****";
    const last4 = plainPhone.slice(-4);
    const masked = plainPhone.slice(0, -4).replace(/\d/g, "*");
    return masked + last4;
}
//# sourceMappingURL=phone.encryption.js.map