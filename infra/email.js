const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

const STAGE = $app.stage;

export const ECCSEmail = new sst.aws.Email("ECCSEMAIL", {
	...(STAGE === "localdev" ? { domain: DOMAIN } : {}),
	...(STAGE === "localdev" ? { sender: DOMAIN } : {}),
	mailFromDomain: `${STAGE}-no-reply@${DOMAIN}`,
});
