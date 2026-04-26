const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

const STAGE = $app.stage;

export const ECCSEmail =
	STAGE === "localdev"
		? new sst.aws.Email("ECCSEMAIL", {
				domain: DOMAIN,
				sender: DOMAIN,
				mailFromDomain: `no-reply@${DOMAIN}`,
			})
		: sst.aws.Email.get(DOMAIN, DOMAIN);
