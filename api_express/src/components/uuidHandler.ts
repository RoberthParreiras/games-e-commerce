import { buffer } from "stream/consumers";
import { v4 as uuidv4 } from "uuid";

function createUuid() {
  const uuid = uuidv4();
  const idInBytes = Buffer.from(uuid.replace(/-/g, ""), "hex");

  return idInBytes;
}

function convertUuidToBytes(uuid: string) {
  const userIdBuffer = Buffer.from(uuid.replace(/-/g, ""), "hex");
  return userIdBuffer;
}

function convertBytesToUuid(bytes: Uint8Array<ArrayBufferLike>) {
  const buffer = Buffer.from(bytes);
  const hex = buffer.toString("hex");
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
    12,
    16
  )}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

export { createUuid, convertUuidToBytes, convertBytesToUuid };
