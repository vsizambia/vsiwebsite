import crypto from "node:crypto";
import { verifyTotp } from "./totp";

export const SAFEGUARDING_COOKIE = "vsi_safeguarding_session";
const ROLES = new Set(["safeguarding_lead", "case_officer", "read_only"]);

function sessionKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin session secret is not configured.");
  return crypto.createHash("sha256").update(secret + ":vsi-safeguarding-session-v1").digest();
}
function totpKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin session secret is not configured.");
  return crypto.createHash("sha256").update(secret + ":vsi-safeguarding-totp-v1").digest();
}
function sign(value) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("base64url");
}
function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
export function hashSafeguardingPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return "scrypt$" + salt + "$" + derived;
}
export function verifySafeguardingPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt" || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2])) return false;
  const derived = crypto.scryptSync(password, parts[1], 64);
  return safeEqual(derived.toString("hex"), parts[2]);
}
export function encryptSafeguardingTotp(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", totpKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}
export function decryptSafeguardingTotp(value) {
  const [ivText, tagText, dataText] = String(value || "").split(".");
  if (!ivText || !tagText || !dataText) throw new Error("Invalid stored authenticator secret.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", totpKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataText, "base64url")), decipher.final()]).toString("utf8");
}
export function generateSafeguardingTotpSecret() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(20);
  let bits = "", output = "";
  for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
  for (let i = 0; i < bits.length; i += 5) output += alphabet[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return output;
}
export function generateTemporaryPassword() {
  return crypto.randomBytes(18).toString("base64url") + "aA7!";
}
export function verifySafeguardingTotp(secret, code) {
  return verifyTotp(secret, code);
}
export function createSafeguardingSession(user) {
  if (!ROLES.has(user.role)) throw new Error("Invalid safeguarding role.");
  const payload = Buffer.from(JSON.stringify({
    sub: String(user.id), username: user.username, name: user.display_name,
    role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  })).toString("base64url");
  return payload + "." + sign(payload);
}
export function readSafeguardingSession(request) {
  const token = request.cookies.get(SAFEGUARDING_COOKIE)?.value;
  if (!token || !process.env.ADMIN_SESSION_SECRET) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.sub || !session.username || !ROLES.has(session.role) || !Number.isInteger(session.exp) || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch { return null; }
}
export function safeguardingPermission(request, permission) {
  const session = readSafeguardingSession(request);
  if (!session) return { allowed: false, session: null };
  const allowed = session.role === "safeguarding_lead" ||
    (session.role === "case_officer" && ["read", "write_cases"].includes(permission)) ||
    (session.role === "read_only" && permission === "read");
  return { allowed, session };
}
export function safeguardingRoleLabels(role) {
  return ({ safeguarding_lead: "Safeguarding Lead", case_officer: "Case Officer", read_only: "Read-only Reviewer" })[role] || "Unknown role";
}
