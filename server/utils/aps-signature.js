import crypto from "crypto";

export function calculateApsSignature(params, shaPhrase) {
	const sortedKeys = Object.keys(params).sort();
	const concatenated = sortedKeys
		.map((key) => `${key}=${params[key]}`)
		.join("");
	const stringToHash = `${shaPhrase}${concatenated}${shaPhrase}`;
	return crypto.createHash("sha256").update(stringToHash).digest("hex");
}

export function aedToFils(aed) {
	return String(Math.round(Number(aed) * 100));
}