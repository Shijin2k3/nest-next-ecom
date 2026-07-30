import * as bcrypt from 'bcrypt';

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  return isPasswordValid;
};

export const hashPassword = async (
  password: string,
  SALT_ROUNDS: number = 10,
) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
};
