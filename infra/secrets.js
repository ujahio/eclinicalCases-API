export const JWT_SECRET = new sst.Secret("JWT_SECRET", process.env.JWT_SECRET);
export const PASS_SECRET = new sst.Secret("PASS_SECRET", process.env.secretKey);