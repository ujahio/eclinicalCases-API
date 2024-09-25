const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

export const email = new sst.aws.Email("MyEmail", {
	sender: `no-reply@${DOMAIN}.com`,
});
