import jwt, { JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Resource } from "sst"; // Assuming SST usage

// Set up JWKS client to retrieve the Cognito public key
const client = jwksClient({
	jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${Resource.eccslabs.id}/.well-known/jwks.json`,
});

// Helper function to get the public key for token verification
const getKey = (header, callback) => {
	client.getSigningKey(header.kid, (err, key) => {
		if (err) {
			callback(err);
		} else {
			const publicKey = key.getPublicKey();
			callback(null, publicKey);
		}
	});
};

// Token verification function
export const verifyTokenFromCognito = (event) => {
	return new Promise((resolve, reject) => {
		const authHeader =
			event.headers.authorization || event.headers.Authorization;

		const token = authHeader.split(" ")[1];
		if (!token) {
			reject({ isValid: false, error: "No token provided!" });
		}

		jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
			if (err) {
				// Handle different types of JWT errors
				const errorMessage =
					err.name === "TokenExpiredError"
						? "Token has expired"
						: err.name === "JsonWebTokenError"
						? "Invalid token"
						: err.message;

				console.error("Token verification error:", errorMessage);
				reject({ isValid: false, error: errorMessage, message: errorMessage });
			} else {
				// Token is valid; return the decoded token data
				resolve({ isValid: true, decoded });
			}
		});
	});
};
