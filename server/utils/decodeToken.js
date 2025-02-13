import jwt from "jsonwebtoken";

const decodeToken = (event) => {
	try {
		const authHeader =
			event.headers.authorization || event.headers.Authorization;

		if (!authHeader) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					error: "No authorization header found",
					message: "Authentication required",
				}),
			};
		}

		const userToken = authHeader.split(" ")[1];

		if (!userToken) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					error: "No token provided",
					message: "Authentication required",
				}),
			};
		}

		const decodedToken = jwt.decode(userToken);

		if (!decodedToken) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					error: "Invalid token",
					message: "Authentication failed",
				}),
			};
		}

		return decodedToken;
	} catch (error) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				error: `Error decoding token: ${error.message}`,
				message: "Authentication failed",
			}),
		};
	}
};

export default decodeToken;
