import bcrypt from "bcrypt";

async function createHashedPassword(password: string) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
}

async function isValidPassword(
  inputPassword: string,
  userPassword: string
): Promise<boolean> {
  const isTheSame = await bcrypt.compare(inputPassword, userPassword);
  return isTheSame;
}

export { createHashedPassword, isValidPassword };
