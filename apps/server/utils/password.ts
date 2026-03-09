import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (plainPassword: string): Promise<string> => {
  console.log("password is " + plainPassword);
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
