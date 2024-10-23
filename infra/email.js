const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

export const ECCSEmail = new sst.aws.Email("ECCSEMAIL", {
	domain: DOMAIN,
	sender: DOMAIN,
	mailFromDomain: `no-reply@${DOMAIN}`,
});
