import * as bcrypt from 'bcrypt';

async function createHashedPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

async function getHashedPassword(password: string, hashedPassword: string) {
  const unHashedpassword = await bcrypt.compare(password, hashedPassword);
  return unHashedpassword;
}

export { createHashedPassword, getHashedPassword };
