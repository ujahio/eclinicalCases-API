import jwt from "jsonwebtoken";
import { Resource } from "sst";
import dbClient from "../services/dbClient.js";
import bcrypt from "bcryptjs";
import {
	AdminCreateUserCommand,
	AdminSetUserPasswordCommand,
	AdminGetUserCommand,
	ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
	updateUserPassword,
	generateOtp,
	storeOtpInDb,
	getOtpFromDb,
	decryptPassword,
	getUserByEmail,
} from "../utils/api_utils.js";
import { sendEmail } from "../services/emailSender.js";
import cognitoClient from "../services/cognitoClient.js";
// import { checkDuplicateUsernameOrEmail } from "../middlewares/verifySignUp";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const signup = async (event) => {
	const { firstName, lastName, email, password, user_role } = JSON.parse(
		event.body
	);

	try {
		// Validate input fields
		if (!firstName || typeof firstName !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: '"firstName" must be a string' }),
			};
		}
		if (!lastName || typeof lastName !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: '"lastName" must be a string' }),
			};
		}
		if (!email || typeof email !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: '"email" must be a string' }),
			};
		}
		if (!password || typeof password !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: '"password" must be a string' }),
			};
		}

		// Check if the email is already registered in Cognito
		try {
			const checkUserCommand = new AdminGetUserCommand({
				UserPoolId: Resource.eccslabs.id,
				Username: email,
			});
			await cognitoClient.send(checkUserCommand);
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "A user with this email already exists.",
				}),
			};
		} catch (error) {
			if (error.name !== "UserNotFoundException") {
				console.error("Error checking for existing user:", error);
				return {
					statusCode: 500,
					body: JSON.stringify({
						message: "Error checking for existing user.",
						error: `Error checking for existing user: ${error.message}`,
					}),
				};
			}
		}

		let teacherId;
		// Fetch the first available teacher's ID from Cognito if the user role is 'student'
		if (user_role === "student") {
			const listTeachersCommand = new ListUsersCommand({
				UserPoolId: Resource.eccslabs.id,
				Filter: 'custom:user_role = "teacher"',
				Limit: 1,
			});

			const teachers = await cognitoClient.send(listTeachersCommand);

			if (!teachers.Users || teachers.Users.length === 0) {
				return {
					statusCode: 400,
					body: JSON.stringify({
						error: "No teacher found in the system.",
					}),
				};
			}

			// Get the first (and only) teacher's ID
			teacherId = teachers.Users[0].Username;
		}

		// Register the new user in Cognito
		const userAttributes = [
			{ Name: "email", Value: email },
			{ Name: "custom:firstName", Value: firstName },
			{ Name: "custom:lastName", Value: lastName },
			{ Name: "custom:user_role", Value: user_role },
		];
		// Only add the teacherId attribute for students
		if (user_role === "student" && teacherId) {
			userAttributes.push({ Name: "custom:teacherId", Value: teacherId });
		}

		const originalPassword = decryptPassword(
			password,
			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
		);

		const signupParams = {
			UserPoolId: Resource.eccslabs.id,
			Username: email,
			Password: password,
			UserAttributes: userAttributes,
		};

		const createUserCommand = new AdminCreateUserCommand(signupParams);
		const signupResponse = await cognitoClient.send(createUserCommand);

		// Set the password to permanent by authenticating the user with the new password
		const setPasswordCommand = new AdminSetUserPasswordCommand({
			UserPoolId: Resource.eccslabs.id,
			Username: email,
			Password: originalPassword,
			Permanent: true,
		});
		await cognitoClient.send(setPasswordCommand);

		console.log("signupResponse", signupResponse);

		// Return a success response without password information
		return {
			statusCode: 201,
			body: JSON.stringify({
				message: "User was registered successfully! Please verify your email.",
				userSub: signupResponse.User?.Username,
			}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
				error: "Error registering user.",
			}),
		};
	}
};

export const signin = async (event) => {
	try {
		const { email, password } = JSON.parse(event.body);

		if (!email) {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: '"email" is required' }),
			};
		}
		if (!EMAIL_REGEX.test(email)) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: '"email" must be a valid email address',
				}),
			};
		}
		if (!password || typeof password !== "string") {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: '"password" must be a string' }),
			};
		}

		const originalPassword = decryptPassword(
			password,
			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
		);

		const params = {
			TableName: Resource.ECCSUsers.name,
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
				body: JSON.stringify({ message: "Invalid email or password" }),
			};
		}

		const isValid = bcrypt.compareSync(originalPassword, user.password);
		if (!isValid) {
			return {
				statusCode: 401,
				body: JSON.stringify({ message: "Invalid email or password" }),
			};
		}

		const userToken = jwt.sign(user, Resource.NEXT_JWT_SECRET.value);
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
		console.error("Error signing in:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error signing in: ${error.message}`,
				message: "Error signing in.",
			}),
		};
	}
};

export const sendOTP = async (event) => {
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
		console.error("Error sending OTP:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error sending OTP: ${error.message}`,
				message: "Error sending one-time password.",
			}),
		};
	}
};

export const verifyOtpAndResetPassword = async (event) => {
	try {
		const { email, otp, newPassword } = JSON.parse(event.body);
		const originalPassword = decryptPassword(
			newPassword,
			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
		);
		const storedOtp = await getOtpFromDb(email);
		const hashedPassword = bcrypt.hashSync(originalPassword, 4);

		if (otp !== storedOtp) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: "Invalid OTP",
					error: "Invalid OTP",
				}),
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
		console.error("Error resetting password:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error resetting password: ${error.message}`,
				message: "Error resetting password.",
			}),
		};
	}
};

// is this needed?
export const getUsers = async () => {
	try {
		const params = {
			TableName: Resource.ECCSUsers.name,
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
				error: `Error retrieving users: ${error.message}`,
				message: "Error retrieving users.",
			}),
		};
	}
};

export const updatePassword = async (event) => {
	try {
		const body = JSON.parse(event.body);
		const email = body.validatedUser.email;
		const { currentPassword, newPassword } = body;

		let originalCurrentPassword = decryptPassword(
			currentPassword,
			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
		);

		const user = await getUserByEmail(email);
		const isPasswordCorrect = bcrypt.compareSync(
			originalCurrentPassword,
			user.password
		);
		if (!isPasswordCorrect) {
			return {
				statusCode: 401,
				body: JSON.stringify({ message: "Password is incorrect" }),
			};
		}

		// Hash and update new password
		let originalNewPassword = decryptPassword(
			newPassword,
			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
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
				error: `Error updating password: ${error.message}`,
				message: "Error updating password.",
			}),
		};
	}
};
