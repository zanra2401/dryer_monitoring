import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt";

export const hashPassword = (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

    return `${HASH_PREFIX}$${salt}$${hash}`;
};

export const verifyPassword = (password: string, storedPassword: string) => {
    const [prefix, salt, hash] = storedPassword.split("$");

    if (prefix !== HASH_PREFIX || !salt || !hash) {
        return false;
    }

    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, salt, KEY_LENGTH);

    return expected.length === actual.length && timingSafeEqual(expected, actual);
};
