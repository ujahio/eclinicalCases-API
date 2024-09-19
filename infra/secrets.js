export const NEXT_JWT_SECRET = new sst.Secret(
	"NEXT_JWT_SECRET",
	process.env.NEXT_JWT_SECRET
);
export const NEXT_PASS_SECRET = new sst.Secret(
	"NEXT_PASS_SECRET",
	process.env.NEXT_SECRET_KEY
);
