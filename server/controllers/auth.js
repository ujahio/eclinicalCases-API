import { Resource } from "sst";
import bcrypt from "bcryptjs";
import {
	SignUpCommand,
	AdminGetUserCommand,
	ListUsersCommand,
	AdminInitiateAuthCommand,
	InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
	// updateUserPassword,
	// generateOtp,
	// storeOtpInDb,
	// getOtpFromDb,
	decryptPassword,
	// getUserByEmail,
} from "../utils/api_utils.js";
import applicationContext from "../../appContext/applicationContext.js";

const cognitoClient = applicationContext.getUserManagementClient();
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const stagePrefix =
	Resource.App.stage.toLowerCase() === "production"
		? ""
		: `${Resource.App.stage.toLowerCase()}.`;

const cognitoWebClient = `${stagePrefix}eccswebclient`;

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
		// This is going to be an issue as users grow, magic number of 60
		if (user_role === "student") {
			const listTeachersCommand = new ListUsersCommand({
				UserPoolId: Resource.eccslabs.id,
				Limit: 60, // Adjust the limit as needed
			});

			const listOfUsers = await cognitoClient.send(listTeachersCommand);

			// Filter users by custom:user_role attribute in code
			// Should only be one teacher
			const teachersList = listOfUsers.Users.filter((user) => {
				return user.Attributes.some(
					(attr) => attr.Name === "custom:user_role" && attr.Value === "teacher"
				);
			});

			if (!teachersList || teachersList.length === 0) {
				return {
					statusCode: 400,
					body: JSON.stringify({
						error: "No teacher found in the system.",
					}),
				};
			}

			// Get the first (and only) teacher's ID
			teacherId = teachersList[0].Username;
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
			ClientId: Resource[cognitoWebClient].id,
			Username: email,
			Password: originalPassword,
			UserAttributes: userAttributes,
		};

		const signupCommand = new SignUpCommand(signupParams);
		await cognitoClient.send(signupCommand);

		// Return a success response without password information
		return {
			statusCode: 201,
			body: JSON.stringify({
				message: "User was registered successfully! Please verify your email.",
			}),
		};
	} catch (error) {
		console.error("Error registering user:", error);
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

		const authCommand = new AdminInitiateAuthCommand({
			UserPoolId: Resource.eccslabs.id,
			ClientId: Resource[cognitoWebClient].id,
			AuthFlow: "ADMIN_NO_SRP_AUTH",
			AuthParameters: {
				USERNAME: email,
				PASSWORD: originalPassword,
			},
		});

		const authResponse = await cognitoClient.send(authCommand);

		// Retrieve additional user attributes
		const userCommand = new AdminGetUserCommand({
			UserPoolId: Resource.eccslabs.id,
			Username: email,
		});

		const userResponse = await cognitoClient.send(userCommand);

		// Extract user attributes
		const firstName = userResponse.UserAttributes.find(
			(attr) => attr.Name === "custom:firstName"
		)?.Value;
		const lastName = userResponse.UserAttributes.find(
			(attr) => attr.Name === "custom:lastName"
		)?.Value;
		const user_role = userResponse.UserAttributes.find(
			(attr) => attr.Name === "custom:user_role"
		)?.Value;

		// Return authentication tokens along with additional user details
		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control":
					"no-store, no-cache, must-revalidate, proxy-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
			body: JSON.stringify({
				message: "Login successful!",
				accessToken: authResponse.AuthenticationResult.AccessToken,
				idToken: authResponse.AuthenticationResult.IdToken,
				refreshToken: authResponse.AuthenticationResult.RefreshToken,
				firstName,
				lastName,
				user_role,
				id: userResponse.Username,
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

export const refreshToken = async (event) => {
	const { refreshToken } = JSON.parse(event.body);
	if (!refreshToken) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: "Missing refresh token" }),
		};
	}

	try {
		const refreshParams = {
			AuthFlow: "REFRESH_TOKEN_AUTH",
			ClientId: Resource[cognitoWebClient].id,
			AuthParameters: {
				REFRESH_TOKEN: refreshToken,
			},
		};

		const refreshCommand = new InitiateAuthCommand(refreshParams);
		const response = await cognitoClient.send(refreshCommand);
		if (response.AuthenticationResult) {
			return {
				statusCode: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control":
						"no-store, no-cache, must-revalidate, proxy-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				},
				body: JSON.stringify({
					accessToken: response.AuthenticationResult.AccessToken,
					expiresIn: response.AuthenticationResult.ExpiresIn,
					refreshToken:
						response.AuthenticationResult.RefreshToken || refreshToken, // Update if new refresh token is provided
				}),
			};
		} else {
			throw new Error("Missing AuthenticationResult in Cognito response");
		}
	} catch (error) {
		console.error("Error refreshing token:", error);

		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Failed to refresh token" }),
		};
	}
};

// export const updatePassword = async (event) => {
// 	try {
// 		const body = JSON.parse(event.body);
// 		const email = body.validatedUser.email;
// 		const { currentPassword, newPassword } = body;

// 		let originalCurrentPassword = decryptPassword(
// 			currentPassword,
// 			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
// 		);

// 		const user = await getUserByEmail(email);
// 		const isPasswordCorrect = bcrypt.compareSync(
// 			originalCurrentPassword,
// 			user.password
// 		);
// 		if (!isPasswordCorrect) {
// 			return {
// 				statusCode: 401,
// 				body: JSON.stringify({ message: "Password is incorrect" }),
// 			};
// 		}

// 		// Hash and update new password
// 		let originalNewPassword = decryptPassword(
// 			newPassword,
// 			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
// 		);
// 		const hashedPassword = bcrypt.hashSync(originalNewPassword, 4);

// 		const updatedUser = await updateUserPassword(email, hashedPassword);

// 		return {
// 			statusCode: 200,
// 			body: JSON.stringify({
// 				message: "Password updated successfully!",
// 				data: updatedUser,
// 			}),
// 		};
// 	} catch (error) {
// 		console.error("Error updating password:", error);

// 		return {
// 			statusCode: 500,
// 			body: JSON.stringify({
// 				error: `Error updating password: ${error.message}`,
// 				message: "Error updating password.",
// 			}),
// 		};
// 	}
// };

// IS THIS NEEDED?
// export const sendOTP = async (event) => {
// 	try {
// 		const { email } = JSON.parse(event.body);
// 		const otp = generateOtp();

// 		console.log("Your OTP is:", otp);

// 		await storeOtpInDb(email, otp);
// 		await sendEmail(
// 			email,
// 			"Your OTP for Password Reset",
// 			`Your OTP is: ${otp}`
// 		);

// 		return {
// 			statusCode: 200,
// 			body: JSON.stringify({
// 				message: "OTP sent to your email. Please verify and reset password.",
// 			}),
// 		};
// 	} catch (error) {
// 		console.error("Error sending OTP:", error);
// 		return {
// 			statusCode: 500,
// 			body: JSON.stringify({
// 				error: `Error sending OTP: ${error.message}`,
// 				message: "Error sending one-time password.",
// 			}),
// 		};
// 	}
// };

// export const verifyOtpAndResetPassword = async (event) => {
// 	try {
// 		const { email, otp, newPassword } = JSON.parse(event.body);
// 		const originalPassword = decryptPassword(
// 			newPassword,
// 			Resource.NEXT_PUBLIC_PASS_SECRET_KEY.value
// 		);
// 		const storedOtp = await getOtpFromDb(email);
// 		const hashedPassword = bcrypt.hashSync(originalPassword, 4);

// 		if (otp !== storedOtp) {
// 			return {
// 				statusCode: 401,
// 				body: JSON.stringify({
// 					message: "Invalid OTP",
// 					error: "Invalid OTP",
// 				}),
// 			};
// 		}
// 		await updateUserPassword(email, hashedPassword);

// 		return {
// 			statusCode: 200,
// 			body: JSON.stringify({
// 				message: "Password reset successfully!",
// 			}),
// 		};
// 	} catch (error) {
// 		console.error("Error resetting password:", error);
// 		return {
// 			statusCode: 500,
// 			body: JSON.stringify({
// 				error: `Error resetting password: ${error.message}`,
// 				message: "Error resetting password.",
// 			}),
// 		};
// 	}
// };
