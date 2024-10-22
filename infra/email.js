const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

export const ECCSEmail = new sst.aws.Email("ECCSEMAIL", {
	sender: DOMAIN,
	mailFromDomain: `no-reply@${DOMAIN}`,
});
