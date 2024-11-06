import jwt from "jsonwebtoken";

const decodeToken = (event) => {
	const authHeader = event.headers.authorization;
	const userToken = authHeader.split(" ")[1];
	return jwt.decode(userToken);
};

export default decodeToken;
