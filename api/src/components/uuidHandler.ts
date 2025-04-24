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

export { createUuid, convertUuidToBytes };
