import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const parameters = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const storedFormat = /^scrypt\$v1\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{86})$/;

/** @param {string} password */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const digest = await derive(password, salt, 64, parameters);
  return ["scrypt", "v1", salt.toString("base64url"), digest.toString("base64url")].join("$");
}

/**
 * @param {string} password
 * @param {string} stored
 */
export async function verifyPassword(password, stored) {
  const match = storedFormat.exec(stored);
  if (!match) return false;

  const salt = Buffer.from(match[1], "base64url");
  const digest = Buffer.from(match[2], "base64url");
  if (salt.toString("base64url") !== match[1] || digest.toString("base64url") !== match[2]) {
    return false;
  }

  return timingSafeEqual(await derive(password, salt, 64, parameters), digest);
}
