import { SignJWT } from "jose";

async function signUser(payload: { user: Uint8Array<ArrayBufferLike> }) {
  const alg: string = process.env.JWT_ALG!;
  const expirationTime = process.env.JWT_EXPIRATION!;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);

  return jwt;
}

export { signUser };
