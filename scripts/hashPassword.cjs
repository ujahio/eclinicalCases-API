const crypto = require("crypto");

const password = process.argv[2]; // Get password from the command line argument
const secretKey = process.env.NEXT_PUBLIC_PASS_SECRET_KEY; // Fetch the secret key from environment

// Ensure secret key is available
if (!secretKey) {
	console.error("Error: NEXT_PUBLIC_PASS_SECRET_KEY is not set");
	process.exit(1);
}

// Hash the password and print it to stdout
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(
	"aes-256-cbc",
	Buffer.from(secretKey, "hex"),
	iv
);
let encrypted = cipher.update(password, "utf8", "hex");
encrypted += cipher.final("hex");
const encryptedPassword = iv.toString("hex") + ":" + encrypted;
console.log(encryptedPassword);
