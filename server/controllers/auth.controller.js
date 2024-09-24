import jwt from "jsonwebtoken";
import dbClient from "../services/dbClient.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
	updateUserPassword,
	generateOtp,
	storeOtpInDb,
	getOtpFromDb,
	encryptPassword,
	decryptPassword,
	getUserByEmail,
} from "../utils/api_utils.js";
import { TABLES } from "../services/dbTables.js";
import { resources } from "../services/resources.js";
import { sendEmail } from "../services/emailSender.js";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const signup = async (req, res) => {
	console.log("heyy", req.body);
	const { firstname, lastname, email, password, roles } = req.body;

	if (!firstname) {
		return res.status(400).json({ error: '"firstname" must be a string' });
	} else if (!lastname || typeof lastname !== "string") {
		return res.status(400).json({ error: '"lastname" must be a string' });
	} else if (!email || typeof email !== "string") {
		return res.status(400).json({ error: '"email" must be a string' });
	} else if (!password || typeof password !== "string") {
		return res.status(400).json({ error: '"password" must be a string' });
	}

	let originalPassword = decryptPassword(
		password,
		resources.NEXT_PUBLIC_PASS_SECRET_KEY
	);
	const hashedPassword = bcrypt.hashSync(originalPassword, 10);
	const userId = uuidv4();
	const created_on = new Date(Date.now()).toISOString();

	const user = {
		id: userId,
		firstname,
		lastname,
		email,
		password: hashedPassword,
		created_on,
		status: "active",
		signUpLevel: 1,
		paymentStatus: "inactive",
		roles: roles || ["user"],
	};

	const params = {
		TableName: TABLES.USER,
		Item: user,
	};

	try {
		const command = new PutCommand(params);
		const result = await dbClient.send(command);
		console.log("result: ", result);

		// Remove password from the user object before sending response
		delete user.password;

		res.status(201).json({
			message: "User was registered successfully!",
			data: user,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: `Could not create user: ${error}` });
	}
};

const signin = async (req, res) => {
	const { email, password } = req.body;

	if (!email) {
		return res.status(400).json({ error: '"email" is required' });
	} else if (!EMAIL_REGEX.test(email)) {
		return res
			.status(400)
			.json({ error: '"email" must be a valid email address' });
	} else if (!password || typeof password !== "string") {
		return res.status(400).json({ error: '"password" must be a string' });
	}

	try {
		let originalPassword = decryptPassword(
			password,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);

		const params = {
			TableName: TABLES.USER,
			FilterExpression: "email = :email",
			ExpressionAttributeValues: {
				":email": email,
			},
		};

		const command = new ScanCommand(params);
		const result = await dbClient.send(command);

		const user = result.Items[0];

		if (!user) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const hashedPassword = user.password;
		const isValid = bcrypt.compareSync(originalPassword, hashedPassword);

		if (!isValid) {
			return res.status(401).json({ error: "Invalid email or password" });
		}
		const token = jwt.sign(user, resources.NEXT_JWT_SECRET, {
			expiresIn: "1h",
		});

		res.status(200).json({
			message: "Login successful!",
			token,
			user: {
				id: user.UserID,
				email: user.email,
				roles: user.roles,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Could not login: " + error });
	}
};

const sendOTP = async (req, res) => {
	try {
		const { email } = req.body;
		const otp = generateOtp();
		console.log("\n Your OTP is: ", otp + "\n");
		await storeOtpInDb(email, otp);
		await sendEmail(
			email,
			"ECCS LABS OTP for Password Reset",
			`Your OTP is: ${otp}`
		);
		res.status(200).json({
			message: "OTP sent to your email. Please verify and reset password.",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Could not send OTP: " + error });
	}
};

const verifyOtpAndResetPassword = async (req, res) => {
	const { email, otp, newPassword } = req.body;

	try {
		let originalPassword = decryptPassword(
			newPassword,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);
		const storedOtp = await getOtpFromDb(email);
		const hashedPassword = bcrypt.hashSync(originalPassword, 4);

		if (otp !== storedOtp) {
			return res.status(401).json({ error: "Invalid OTP" });
		}
		await updateUserPassword(email, hashedPassword);
		res.status(200).json({
			message: "Password reset successfully!",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Could not reset password: " + error });
	}
};

const getUsers = async (req, res) => {
	try {
		const params = {
			TableName: TABLES.USER,
		};

		const command = new ScanCommand(params);
		const result = await dbClient.send(command);

		const users = result.Items;

		res.status(200).json({
			message: "Users retrieved successfully!",
			data: users,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Could not retrieve users: " + error });
	}
};

const updatePassword = async (req, res) => {
	try {
		const email = req.validatedUser.email;
		const { currentPassword, newPassword } = req.body;

		let originalCurrentPassword = decryptPassword(
			currentPassword,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);

		const user = await getUserByEmail(email);
		const isPasswordCorrect = bcrypt.compareSync(
			originalCurrentPassword,
			user.password
		);
		if (!isPasswordCorrect) {
			return res.status(401).json({ error: "Current password is incorrect" });
		}

		// Hash and update new password
		let originalNewPassword = decryptPassword(
			newPassword,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);
		const hashedPassword = bcrypt.hashSync(originalNewPassword, 4);

		const updatedUser = await updateUserPassword(email, hashedPassword);
		res.status(200).json({
			message: "Password updated successfully!",
			data: updatedUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Could not update password: " + error });
	}
};

export {
	signup,
	signin,
	sendOTP,
	verifyOtpAndResetPassword,
	getUsers,
	updatePassword,
};
