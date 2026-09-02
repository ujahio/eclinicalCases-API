export const Payments = new sst.aws.Dynamo("Payments", {
	fields: {
		paymentId: "string",
		userId: "string",
		merchantReference: "string",
		status: "string",
		customerEmail: "string",
		createdAt: "string",
	},
	primaryIndex: { hashKey: "paymentId", rangeKey: "userId" },
	globalIndexes: {
		UserIndex: { hashKey: "userId", rangeKey: "createdAt" },
		EmailIndex: { hashKey: "customerEmail" },
		MerchantRefIndex: { hashKey: "merchantReference" },
		StatusIndex: { hashKey: "status", rangeKey: "createdAt" },
	},
});
