import crypto from "crypto";
import { Resource } from "sst";

export function saltAndHashPassword(password: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(Resource.NEXT_PASS_SECRET_KEY.value as string, "hex"),
    iv
  );
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
