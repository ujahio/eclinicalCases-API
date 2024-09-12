export const JWT_SECRET = new sst.Secret("JWT_SECRET", process.env.JwtSecret);
export const PASS_SECRET = new sst.Secret("PASS_SECRET", process.env.secretKey);
