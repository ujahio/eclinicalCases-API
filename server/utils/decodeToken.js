import jwt from "jsonwebtoken";

const decodeToken = (event) => {
	try {
		const authHeader =
			event.headers.authorization || event.headers.Authorization;

		const userToken = authHeader.split(" ")[1];
		return jwt.decode(userToken);
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: `Error decoding token: ${error.message}`,
				message: "Invalid Code.",
			}),
		};
	}
};

export default decodeToken;
