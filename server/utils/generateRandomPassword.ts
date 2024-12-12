import crypto from "crypto";

const generatePassword = (): string => {
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const special = "!@#$%^&*";

	// Get one random character from each required set
	const requiredChars = [
		uppercase[crypto.randomInt(uppercase.length)],
		lowercase[crypto.randomInt(lowercase.length)],
		numbers[crypto.randomInt(numbers.length)],
		special[crypto.randomInt(special.length)],
	];

	// Generate remaining random bytes
	const remainingLength = 8; // 12 - 4 required chars
	const allChars = uppercase + lowercase + numbers + special;
	const randomChars = Array.from(
		{ length: remainingLength },
		() => allChars[crypto.randomInt(allChars.length)]
	);

	// Combine and shuffle all characters
	return [...requiredChars, ...randomChars]
		.sort(() => crypto.randomInt(3) - 1)
		.join("");
};

export default generatePassword;
