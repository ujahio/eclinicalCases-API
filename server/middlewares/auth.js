import jwt from "jsonwebtoken";
import { resources } from "../services/resources.js";

export const verifyToken = async (req, res, next) => {
	let token = req.headers.authorization;
	if (!token) {
		return res.status(403).send({ message: "No token provided!" });
	}
	token = req.headers.authorization.split(" ")[1];
	jwt.verify(token, resources.NEXT_JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: "Unauthorized!" });
		}
		const data = {
			id: decoded.id,
			email: decoded.email,
			roles: decoded.roles,
			firstname: decoded.firstname,
			lastname: decoded.lastname,
		};
		req.validatedUser = data;
		next();
	});
};
