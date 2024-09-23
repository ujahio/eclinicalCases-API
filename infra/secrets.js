export const NEXT_JWT_SECRET = new sst.Secret(
	"NEXT_JWT_SECRET",
	process.env.NEXT_JWT_SECRET
);
export const NEXT_PASS_SECRET = new sst.Secret(
	"NEXT_PASS_SECRET",
	process.env.NEXT_SECRET_KEY
);
export const NEXT_PUBLIC_BASE_URL = new sst.Secret(
	"NEXT_PUBLIC_BASE_URL",
	process.env.NEXT_PUBLIC_BASE_URL
);
export const NEXT_NODE_ENV = new sst.Secret(
	"NEXT_NODE_ENV",
	process.env.NEXT_NODE_ENV
);
export const NEXT_PASS_SECRET_KEY = new sst.Secret(
	"NEXT_PASS_SECRET_KEY",
	process.env.NEXT_PASS_SECRET_KEY
);
