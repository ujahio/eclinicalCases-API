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
import { checkDuplicateUsernameOrEmail } from "../middlewares/verifySignUp";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const signup = async (event) => {
	const duplicateCheckResponse = await checkDuplicateUsernameOrEmail(event);

	if (duplicateCheckResponse) {
		return duplicateCheckResponse;
	}
	try {
		const { firstname, lastname, email, password, roles } = JSON.parse(
			event.body
		);

		if (!firstname || typeof firstname !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: '"firstname" must be a string' }),
			};
		}
		if (!lastname || typeof lastname !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: '"lastname" must be a string' }),
			};
		}
		if (!email || typeof email !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: '"email" must be a string' }),
			};
		}
		if (!password || typeof password !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: '"password" must be a string' }),
			};
		}

		const originalPassword = decryptPassword(
			password,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);
		const hashedPassword = bcrypt.hashSync(originalPassword, 10);
		const userId = uuidv4();
		const created_on = new Date().toISOString();

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
			roles: roles || "user",
		};

		const params = {
			TableName: TABLES.USER,
			Item: user,
		};

		const command = new PutCommand(params);
		await dbClient.send(command);

		// Remove password from the user object before sending response
		delete user.password;

		return {
			statusCode: 201,
			body: JSON.stringify({
				message: "User was registered successfully!",
				data: user,
			}),
		};
	} catch (error) {
		console.error("Signup error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Could not create user: ${error.message}`,
			}),
		};
	}
};

const signin = async (event) => {
	try {
		const { email, password } = JSON.parse(event.body);

		if (!email) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: '"email" is required' }),
			};
		}
		if (!EMAIL_REGEX.test(email)) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: '"email" must be a valid email address',
				}),
			};
		}
		if (!password || typeof password !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: '"password" must be a string' }),
			};
		}

		const originalPassword = decryptPassword(
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
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Invalid email or password" }),
			};
		}

		const isValid = bcrypt.compareSync(originalPassword, user.password);
		if (!isValid) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Invalid email or password" }),
			};
		}

		const userToken = jwt.sign(user, resources.NEXT_JWT_SECRET, {
			expiresIn: "1h",
		});
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Login successful!",
				token: userToken,
				user: {
					id: user.id,
					email: user.email,
					roles: user.roles,
				},
			}),
		};
	} catch (error) {
		console.error("Signin error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Could not login: " + error.message }),
		};
	}
};

const sendOTP = async (event) => {
	try {
		const { email } = JSON.parse(event.body);
		const otp = generateOtp();

		console.log("Your OTP is:", otp);

		await storeOtpInDb(email, otp);
		await sendEmail(
			email,
			"Your OTP for Password Reset",
			`Your OTP is: ${otp}`
		);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "OTP sent to your email. Please verify and reset password.",
			}),
		};
	} catch (error) {
		console.error("Send OTP error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Could not send OTP: " + error.message }),
		};
	}
};

const verifyOtpAndResetPassword = async (event) => {
	try {
		const { email, otp, newPassword } = JSON.parse(event.body);
		const originalPassword = decryptPassword(
			newPassword,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);
		const storedOtp = await getOtpFromDb(email);
		const hashedPassword = bcrypt.hashSync(originalPassword, 4);

		if (otp !== storedOtp) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Invalid OTP" }),
			};
		}
		await updateUserPassword(email, hashedPassword);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Password reset successfully!",
			}),
		};
	} catch (error) {
		console.error("Reset password error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Could not reset password: " + error.message,
			}),
		};
	}
};

const getUsers = async () => {
	try {
		const params = {
			TableName: TABLES.USER,
		};

		const command = new ScanCommand(params);
		const result = await dbClient.send(command);

		const users = result.Items;

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Users retrieved successfully!",
				data: users,
			}),
		};
	} catch (error) {
		console.error("Error retrieving users:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Could not retrieve users: " + error.message,
			}),
		};
	}
};

const updatePassword = async (event) => {
	try {
		const body = JSON.parse(event.body);
		const email = body.validatedUser.email;
		const { currentPassword, newPassword } = body;

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
			return {
				statusCode: 401,
				body: JSON.stringify({ error: "Current password is incorrect" }),
			};
		}

		// Hash and update new password
		let originalNewPassword = decryptPassword(
			newPassword,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);
		const hashedPassword = bcrypt.hashSync(originalNewPassword, 4);

		const updatedUser = await updateUserPassword(email, hashedPassword);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Password updated successfully!",
				data: updatedUser,
			}),
		};
	} catch (error) {
		console.error("Error updating password:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "Could not update password: " + error.message,
			}),
		};
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
