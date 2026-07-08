import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export const hashUserPassword = async (password: string) => {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const verifyUserPassword = async (password: string, storedPassword: string) => {
    return bcrypt.compare(password, storedPassword);
};
