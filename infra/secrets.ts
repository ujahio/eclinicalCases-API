export const HASH_SECRET_KEY = new sst.Secret(
	"HASH_SECRET_KEY",
	process.env.HASH_SECRET_KEY,
);
export const NEXT_PUBLIC_BASE_URL = new sst.Secret(
	"NEXT_PUBLIC_BASE_URL",
	process.env.NEXT_PUBLIC_BASE_URL,
);
export const NEXT_PUBLIC_NODE_ENV = new sst.Secret(
	"NEXT_PUBLIC_NODE_ENV",
	process.env.NEXT_PUBLIC_NODE_ENV,
);
export const NEXT_PUBLIC_DOMAIN = new sst.Secret(
	"NEXT_PUBLIC_DOMAIN",
	process.env.NEXT_PUBLIC_DOMAIN,
);
export const AUTH_SECRET = new sst.Secret(
	"AUTH_SECRET",
	process.env.AUTH_SECRET,
);

export const APS_ACCESS_CODE = new sst.Secret(
	"APS_ACCESS_CODE",
	process.env.APS_ACCESS_CODE,
);

export const APS_MERCHANT_IDENTIFIER = new sst.Secret(
	"APS_MERCHANT_IDENTIFIER",
	process.env.APS_MERCHANT_IDENTIFIER,
);

export const APS_SHA_REQUEST_PHRASE = new sst.Secret(
	"APS_SHA_REQUEST_PHRASE",
	process.env.APS_SHA_REQUEST_PHRASE,
);

export const APS_SHA_RESPONSE_PHRASE = new sst.Secret(
	"APS_SHA_RESPONSE_PHRASE",
	process.env.APS_SHA_RESPONSE_PHRASE,
);

export const SUBSCRIPTION_FEE_AED = new sst.Secret(
	"SUBSCRIPTION_FEE_AED",
	process.env.SUBSCRIPTION_FEE_AED,
);

export const SUBSCRIPTION_DURATION_DAYS = new sst.Secret(
	"SUBSCRIPTION_DURATION_DAYS",
	process.env.SUBSCRIPTION_DURATION_DAYS,
);
