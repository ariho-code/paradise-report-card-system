import { cookies } from "next/headers";

const COOKIE = "pcs_session";
const MAX_AGE = 60 * 60 * 24 * 14;

function secret() {
  return process.env.AUTH_SECRET || "pcs-dev-secret-change-this-before-production";
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToBase64Url(signature);
}

function safeEqual(a: string, b: string) {
  const left = base64UrlToBytes(a);
  const right = base64UrlToBytes(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
}

export async function createSessionToken(username: string) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ u: username, exp: Date.now() + MAX_AGE * 1000 })),
  );
  return `${payload}.${await sign(payload)}`;
}

export async function readSessionToken(token: string | undefined | null) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await sign(payload);
  if (!safeEqual(sig, expected)) return null;
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(payload));
    const data = JSON.parse(json) as { u: string; exp: number };
    if (!data.exp || data.exp < Date.now()) return null;
    return { username: data.u };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return readSessionToken(jar.get(COOKIE)?.value);
}

export async function setSession(username: string) {
  const jar = await cookies();
  jar.set(COOKIE, await createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
