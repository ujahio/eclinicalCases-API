import crypto from "crypto";
import { Resource } from "sst";

const NextPassSecretKey =
	"85b492d819a25e6fd4342383d4fa3e25e1356cdd7bb6af4ea1bdafacb6e4c731";

export function saltAndHashPassword(password: string) {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		Buffer.from(NextPassSecretKey, "hex"),
		iv
	);
	let encrypted = cipher.update(password, "utf8", "hex");
	encrypted += cipher.final("hex");
	return iv.toString("hex") + ":" + encrypted;
}

// const cipher = crypto.createCipheriv(
// 	"aes-256-cbc",
// 	Buffer.from(Resource.NEXT_PASS_SECRET_KEY.value as string, "hex"),
// 	iv
// );
