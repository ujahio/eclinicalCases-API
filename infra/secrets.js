export const JwtSecret = new sst.Secret("JwtSecret", process.env.JwtSecret);
export const PassSecret = new sst.Secret("PassSecret", process.env.secretKey);
