import crypto from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(value) {
  const normalized = String(value || "").replace(/\s+/g, "").replace(/=+$/g, "").toUpperCase();
  if (!normalized || !/^[A-Z2-7]+$/.test(normalized)) return null;
  let bits = "";
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) return null;
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function base32Encode(buffer) {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
  let result = "";
  for (let i = 0; i < bits.length; i += 5) result += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return result;
}

export function getAdminTotpSecret() {
  const configured = process.env.ADMIN_TOTP_SECRET?.trim();
  if (configured) return configured;
  if (!process.env.ADMIN_SESSION_SECRET) return null;
  return base32Encode(crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update("VSI-ADMIN-TOTP-V1").digest().subarray(0, 20));
}

export function getAdminTotpUri() {
  const secret = getAdminTotpSecret();
  if (!secret) return null;
  return `otpauth://totp/VSI%20Admin?secret=${encodeURIComponent(secret)}&issuer=VSI&algorithm=SHA1&digits=6&period=30`;
}

export function verifyTotp(secret, token, now = Date.now()) {
  const key = base32Decode(secret);
  const normalizedToken = String(token || "").replace(/\s+/g, "");
  if (!key || !/^\d{6}$/.test(normalizedToken)) return false;
  const currentCounter = Math.floor(now / 1000 / 30);
  for (const offset of [-1, 0, 1]) {
    const counter = currentCounter + offset;
    if (counter < 0) continue;
    const message = Buffer.alloc(8);
    message.writeBigUInt64BE(BigInt(counter));
    const digest = crypto.createHmac("sha1", key).update(message).digest();
    const index = digest[digest.length - 1] & 0x0f;
    const binary = ((digest[index] & 0x7f) << 24) | ((digest[index + 1] & 0xff) << 16) | ((digest[index + 2] & 0xff) << 8) | (digest[index + 3] & 0xff);
    const expected = String(binary % 1000000).padStart(6, "0");
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalizedToken))) return true;
  }
  return false;
}
