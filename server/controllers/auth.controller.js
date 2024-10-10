import jwt from "jsonwebtoken";
import dbClient from "../services/dbClient.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
	updateUserPassword,
	generateOtp,
	storeOtpInDb,
	getOtpFromDb,
	decryptPassword,
	getUserByEmail,
} from "../utils/api_utils.js";
import { TABLES } from "../services/dbTables.js";
import { resources } from "../services/resources.js";
import { sendEmail } from "../services/emailSender.js";
import { checkDuplicateUsernameOrEmail } from "../middlewares/verifySignUp";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const signup = async (event) => {
	const { firstname, lastname, email, password, user_role } = JSON.parse(
		event.body
	);
	try {
		// Validate input fields
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

		const duplicateCheckResponse = await checkDuplicateUsernameOrEmail(event);

		if (duplicateCheckResponse) {
			return duplicateCheckResponse;
		}

		let teacherId;

		// Fetch the single teacher's ID from DynamoDB
		if (user_role === "student") {
			const teacherParams = {
				TableName: TABLES.USER,
				IndexName: "RoleIndex", // Use user_role instead of role
				KeyConditionExpression: "user_role = :user_role", // Use user_role
				ExpressionAttributeValues: {
					":user_role": "teacher",
				},
			};

			const teacherCommand = new QueryCommand(teacherParams);
			const teacherResult = await dbClient.send(teacherCommand);

			if (!teacherResult.Items || teacherResult.Items.length === 0) {
				return {
					statusCode: 500,
					body: JSON.stringify({
						error: "No teacher found in the system.",
					}),
				};
			}

			// Get the first (and only) teacher's ID
			teacherId = teacherResult.Items[0].id;
		}

		// Prepare the new user data
		const originalPassword = decryptPassword(
			password,
			resources.NEXT_PUBLIC_PASS_SECRET_KEY
		);
		const hashedPassword = bcrypt.hashSync(originalPassword, 10);
		const userId = uuidv4();
		const createdAt = new Date().toISOString();

		const user = {
			id: userId,
			firstname,
			lastname,
			email,
			password: hashedPassword,
			createdAt,
			status: "active",
			signUpLevel: 1,
			paymentStatus: "inactive",
			user_role,
			teacherId: user_role === "student" ? teacherId : null,
		};

		const params = {
			TableName: TABLES.USER,
			Item: user,
		};

		const command = new PutCommand(params);
		await dbClient.send(command);

		// Remove password before sending response
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

		const userToken = jwt.sign(user, resources.NEXT_JWT_SECRET);
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Login successful!",
				token: userToken,
				user: {
					id: user.id,
					email: user.email,
					user_role: user.user_role,
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

// is this needed?
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

export { signin, sendOTP, verifyOtpAndResetPassword, getUsers, updatePassword };
