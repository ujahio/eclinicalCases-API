export const NEXT_JWT_SECRET = new sst.Secret(
	"NEXT_JWT_SECRET",
	process.env.NEXT_JWT_SECRET
);
export const NEXT_PUBLIC_PASS_SECRET_KEY = new sst.Secret(
	"NEXT_PUBLIC_PASS_SECRET_KEY",
	process.env.NEXT_PUBLIC_PASS_SECRET_KEY
);
export const NEXT_PUBLIC_BASE_URL = new sst.Secret(
	"NEXT_PUBLIC_BASE_URL",
	process.env.NEXT_PUBLIC_BASE_URL
);
export const NEXT_PUBLIC_NODE_ENV = new sst.Secret(
	"NEXT_PUBLIC_NODE_ENV",
	process.env.NEXT_PUBLIC_NODE_ENV
);
export const NEXT_PUBLIC_DOMAIN = new sst.Secret(
	"NEXT_PUBLIC_DOMAIN",
	process.env.NEXT_PUBLIC_DOMAIN
);
export const AUTH_SECRET = new sst.Secret(
	"AUTH_SECRET",
	process.env.AUTH_SECRET
);
