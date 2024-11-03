import jwt, { JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Resource } from "sst";

// Set up JWKS client to retrieve the Cognito public key
const client = jwksClient({
	jwksUri: `https://cognito-idp.${process.env.NEXT_PUBLIC_REGION}.amazonaws.com/${Resource.eccslabs.id}/.well-known/jwks.json`,
});

// Helper to get the public key for token verification
const getKey = (header: any, callback: any) => {
	client.getSigningKey(header.kid, (err, key) => {
		if (err) {
			callback(err);
		} else {
			const publicKey = key?.getPublicKey();
			callback(null, publicKey);
		}
	});
};

// Verify token function
export const verifyTokenFromCognito = (token: string) => {
	return new Promise<{
		isValid: boolean;
		decoded?: JwtPayload;
		error?: string;
	}>((resolve) => {
		if (!token) {
			resolve({ isValid: false, error: "No token provided!" });
		}

		jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
			if (err) {
				// Handle different types of JWT errors
				if (err.name === "TokenExpiredError") {
					console.error("Token has expired");
					resolve({ isValid: false, error: "Token has expired" });
				} else if (err.name === "JsonWebTokenError") {
					console.error("Invalid token");
					resolve({ isValid: false, error: "Invalid token" });
				} else {
					console.error("Could not verify token", err.message);
					resolve({ isValid: false, error: err.message });
				}
			} else {
				// Token is valid; return the decoded token data
				resolve({ isValid: true, decoded: decoded as JwtPayload });
			}
		});
	});
};
