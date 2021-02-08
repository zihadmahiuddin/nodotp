import crypto from "crypto";

import { getHWID } from "hwid";

const IV = "c23054f2e38846a246309e012245794f",
  FALLBACK_KEY =
    "5a1bede720005545b31916f0d7818536909b2115afe58c6ebd89434b650254fb";

const getKey = async () => {
  let hwid = await getHWID({ hash: true, algorithm: "sha256" });
  const key = hwid
    ? Buffer.from(hwid, "hex")
    : Buffer.from(FALLBACK_KEY, "hex");
  return key;
};

export const encryptAccountSecret = async (secret: string) => {
  const key = await getKey();
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(IV, "hex")
  );
  return Buffer.concat([cipher.update(secret), cipher.final()]).toString("hex");
};

export const decryptAccountSecret = async (encryptedSecret: string) => {
  const key = await getKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(IV, "hex")
  );
  return Buffer.concat([
    decipher.update(encryptedSecret, "hex"),
    decipher.final(),
  ]).toString("utf8");
};
