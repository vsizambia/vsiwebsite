import crypto from "node:crypto";

export const ADMIN_COOKIE = "vsi_admin_session";
export const ADMIN_PENDING_COOKIE = "vsi_admin_2fa_pending";

function sign(value) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("hex");
}

function verifySignedToken(token) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(expires);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function isAdminAuthenticated(request) {
  return verifySignedToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export function isAdminTwoFactorPending(request) {
  return verifySignedToken(request.cookies.get(ADMIN_PENDING_COOKIE)?.value);
}

export function makeSignedToken(maxAgeSeconds) {
  const expires = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  return `${expires}.${sign(String(expires))}`;
}

export function validAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string" || password.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}
