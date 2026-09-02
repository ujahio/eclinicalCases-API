import { Resource } from "sst";
import applicationContext from "../../appContext/applicationContext.js";
import decodeToken from "../utils/decodeToken.js";
import getUserInfo from "../persistence/getUserInfo.js";
import { calculateApsSignature, aedToFils } from "../utils/aps-signature.js";
import {
	QueryCommand,
	PutCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
	AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const dbClient = applicationContext.getDBClient();
const cognitoClient = applicationContext.getUserManagementClient();

const stagePrefix =
	Resource.App.stage.toLowerCase() === "production"
		? ""
		: `${Resource.App.stage.toLowerCase()}.`;

const cognitoWebClient = `${stagePrefix}eccswebclient`;

const response = (statusCode, body) => ({
	statusCode,
	body: JSON.stringify(body),
});

const APS_SANDBOX_PAYMENT_PAGE = "https://sbcheckout.payfort.com/FortAPI/paymentPage";
const APS_SANDBOX_PAYMENT_API = "https://sbpaymentservices.payfort.com/FortAPI/paymentApi";
const APS_PRODUCTION_PAYMENT_PAGE = "https://checkout.payfort.com/FortAPI/paymentPage";
const APS_PRODUCTION_PAYMENT_API = "https://paymentservices.payfort.com/FortAPI/paymentApi";

const isProduction = () => Resource.NEXT_PUBLIC_NODE_ENV?.value === "production";
const getPaymentPageUrl = () => isProduction() ? APS_PRODUCTION_PAYMENT_PAGE : APS_SANDBOX_PAYMENT_PAGE;
const getPaymentApiUrl = () => isProduction() ? APS_PRODUCTION_PAYMENT_API : APS_SANDBOX_PAYMENT_API;

function parseBody(body) {
	if (!body) return {};
	return Object.fromEntries(new URLSearchParams(body));
}

export const createCheckout = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		if (decodedToken.statusCode) {
			return decodedToken;
		}

		const username = decodedToken.username;
		const userInfo = await getUserInfo(username);

		if (userInfo.statusCode) {
			return userInfo;
		}

		if (userInfo.user_role === "teacher") {
			return response(403, {
				error: "Teachers are not required to pay.",
				message: "Teachers do not need a subscription.",
			});
		}

		const body = event.body ? JSON.parse(event.body) : {};
		const paymentType = body.paymentType === "one-time" ? "one-time" : "subscription";

		const merchantReference = `ECCS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const subscriptionFee = Resource.SUBSCRIPTION_FEE_AED?.value || "100";
		const amountInFils = aedToFils(subscriptionFee);

		const params = {
			service_command: "TOKENIZATION",
			access_code: Resource.APS_ACCESS_CODE.value,
			merchant_identifier: Resource.APS_MERCHANT_IDENTIFIER.value,
			merchant_reference: merchantReference,
			language: "en",
			return_url: `${Resource.NEXT_PUBLIC_BASE_URL.value}/api/payment/return`,
		};

		const signature = calculateApsSignature(params, Resource.APS_SHA_REQUEST_PHRASE.value);

		const now = new Date().toISOString();
		const paymentRecord = {
			paymentId: merchantReference,
			userId: username,
			merchantReference,
			paymentType,
			status: "pending",
			amount: parseInt(amountInFils, 10),
			currency: "AED",
			customerEmail: userInfo.email,
			createdAt: now,
			updatedAt: now,
		};

		await dbClient.send(
			new PutCommand({
				TableName: Resource.Payments.name,
				Item: paymentRecord,
			})
		);

		return response(200, {
			formAction: getPaymentPageUrl(),
			fields: {
				...params,
				signature,
			},
		});
	} catch (error) {
		console.error("Error creating checkout:", error);
		return response(500, {
			error: `Error creating checkout: ${error.message}`,
			message: "Error creating checkout.",
		});
	}
};

export const handleReturn = async (event) => {
	try {
		let params;
		if (event.httpMethod === "POST" && event.body) {
			params = parseBody(event.body);
		} else if (event.queryStringParameters) {
			params = event.queryStringParameters;
		} else {
			return response(400, { error: "Invalid request" });
		}

		const signature = params.signature;
		const { signature: _, ...paramsWithoutSignature } = params;
		const expectedSignature = calculateApsSignature(
			paramsWithoutSignature,
			Resource.APS_SHA_RESPONSE_PHRASE.value
		);

		if (signature !== expectedSignature) {
			return response(400, { error: "Invalid signature" });
		}

		const merchantReference = params.merchant_reference;
		if (!merchantReference) {
			return response(400, { error: "Missing merchant_reference" });
		}

		const queryResult = await dbClient.send(
			new QueryCommand({
				TableName: Resource.Payments.name,
				IndexName: "MerchantRefIndex",
				KeyConditionExpression: "merchantReference = :mr",
				ExpressionAttributeValues: {
					":mr": merchantReference,
				},
			})
		);

		if (!queryResult.Items || queryResult.Items.length === 0) {
			return response(404, { error: "Payment not found" });
		}

		const payment = queryResult.Items[0];

		if (params.fort_id) {
			if (params.status === "14" || params.status === "01") {
				const now = new Date().toISOString();
				const durationDays = parseInt(Resource.SUBSCRIPTION_DURATION_DAYS?.value || "365", 10);
				const subscriptionEnd = new Date();
				subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

				const isSubscription = payment.paymentType === "subscription";

				const updateFields = {
					"#status": "status",
				};
				const updateValues = {
					":status": isSubscription ? "captured" : "completed",
					":fortId": params.fort_id,
					":start": now,
					":end": subscriptionEnd.toISOString(),
					":now": now,
				};

				let updateExpr = "SET #status = :status, fort_id = :fortId, subscriptionStart = :start, subscriptionEnd = :end, updatedAt = :now";

				if (isSubscription) {
					updateExpr += ", agreementId = :agreementId, tokenName = :tokenName";
					updateValues[":agreementId"] = params.agreement_id || "";
					updateValues[":tokenName"] = params.token_name || "";
				}

				await dbClient.send(
					new UpdateCommand({
						TableName: Resource.Payments.name,
						Key: {
							paymentId: payment.paymentId,
							userId: payment.userId,
						},
						UpdateExpression: updateExpr,
						ExpressionAttributeNames: updateFields,
						ExpressionAttributeValues: updateValues,
					})
				);

				await cognitoClient.send(
					new AdminUpdateUserAttributesCommand({
						UserPoolId: Resource.eccslabs.id,
						Username: payment.userId,
						UserAttributes: [
							{
								Name: "custom:paymentId",
								Value: payment.paymentId,
							},
						],
					})
				);

				return {
					statusCode: 302,
					headers: {
						Location: `${Resource.NEXT_PUBLIC_BASE_URL.value}/dashboard`,
					},
					body: "",
				};
			} else {
				await dbClient.send(
					new UpdateCommand({
						TableName: Resource.Payments.name,
						Key: {
							paymentId: payment.paymentId,
							userId: payment.userId,
						},
						UpdateExpression:
							"SET #status = :status, updatedAt = :now",
						ExpressionAttributeNames: {
							"#status": "status",
						},
						ExpressionAttributeValues: {
							":status": "failed",
							":now": new Date().toISOString(),
						},
					})
				);

				return {
					statusCode: 302,
					headers: {
						Location: `${Resource.NEXT_PUBLIC_BASE_URL.value}/payment-failed`,
					},
					body: "",
				};
			}
		}

		if (params.status !== "20") {
			await dbClient.send(
				new UpdateCommand({
					TableName: Resource.Payments.name,
					Key: {
						paymentId: payment.paymentId,
						userId: payment.userId,
					},
					UpdateExpression:
						"SET #status = :status, updatedAt = :now",
					ExpressionAttributeNames: {
						"#status": "status",
					},
					ExpressionAttributeValues: {
						":status": "failed",
						":now": new Date().toISOString(),
					},
				})
			);

			return {
				statusCode: 302,
				headers: {
					Location: `${Resource.NEXT_PUBLIC_BASE_URL.value}/payment-failed`,
				},
				body: "",
			};
		}

		const tokenName = params.token_name;
		if (!tokenName) {
			return response(400, { error: "Missing token_name" });
		}

		await dbClient.send(
			new UpdateCommand({
				TableName: Resource.Payments.name,
				Key: {
					paymentId: payment.paymentId,
					userId: payment.userId,
				},
				UpdateExpression:
					"SET tokenName = :tokenName, #status = :status, updatedAt = :now",
				ExpressionAttributeNames: {
					"#status": "status",
				},
				ExpressionAttributeValues: {
					":tokenName": tokenName,
					":status": "tokenized",
					":now": new Date().toISOString(),
				},
			})
		);

		const subscriptionFee = Resource.SUBSCRIPTION_FEE_AED?.value || "100";
		const amountInFils = aedToFils(subscriptionFee);

		const purchaseParams = {
			command: "PURCHASE",
			access_code: Resource.APS_ACCESS_CODE.value,
			merchant_identifier: Resource.APS_MERCHANT_IDENTIFIER.value,
			merchant_reference: merchantReference,
			amount: amountInFils,
			currency: "AED",
			language: "en",
			customer_email: payment.customerEmail,
			token_name: tokenName,
			return_url: `${Resource.NEXT_PUBLIC_BASE_URL.value}/api/payment/return`,
		};

		const purchaseSignature = calculateApsSignature(
			purchaseParams,
			Resource.APS_SHA_REQUEST_PHRASE.value
		);

		purchaseParams.signature = purchaseSignature;

		const purchaseRes = await fetch(getPaymentApiUrl(), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(purchaseParams),
		});

		const purchaseData = await purchaseRes.json();

		if (purchaseData["3ds_url"]) {
			return {
				statusCode: 302,
				headers: {
					Location: purchaseData["3ds_url"],
				},
				body: "",
			};
		}

		if (purchaseData.status === "14") {
			const now = new Date().toISOString();
			const durationDays = parseInt(Resource.SUBSCRIPTION_DURATION_DAYS?.value || "365", 10);
			const subscriptionEnd = new Date();
			subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

			const isSubscription = payment.paymentType === "subscription";

			const updateValues = {
				":status": isSubscription ? "captured" : "completed",
				":fortId": purchaseData.fort_id,
				":start": now,
				":end": subscriptionEnd.toISOString(),
				":now": now,
			};

			let updateExpr = "SET #status = :status, fort_id = :fortId, subscriptionStart = :start, subscriptionEnd = :end, updatedAt = :now";

			if (isSubscription) {
				updateExpr += ", agreementId = :agreementId, tokenName = :tokenName";
				updateValues[":agreementId"] = purchaseData.agreement_id || "";
				updateValues[":tokenName"] = purchaseData.token_name || "";
			}

			await dbClient.send(
				new UpdateCommand({
					TableName: Resource.Payments.name,
					Key: {
						paymentId: payment.paymentId,
						userId: payment.userId,
					},
					UpdateExpression: updateExpr,
					ExpressionAttributeNames: {
						"#status": "status",
					},
					ExpressionAttributeValues: updateValues,
				})
			);

			await cognitoClient.send(
				new AdminUpdateUserAttributesCommand({
					UserPoolId: Resource.eccslabs.id,
					Username: payment.userId,
					UserAttributes: [
						{
							Name: "custom:paymentId",
							Value: payment.paymentId,
						},
					],
				})
			);

			return {
				statusCode: 302,
				headers: {
					Location: `${Resource.NEXT_PUBLIC_BASE_URL.value}/dashboard`,
				},
				body: "",
			};
		} else {
			await dbClient.send(
				new UpdateCommand({
					TableName: Resource.Payments.name,
					Key: {
						paymentId: payment.paymentId,
						userId: payment.userId,
					},
					UpdateExpression:
						"SET #status = :status, updatedAt = :now",
					ExpressionAttributeNames: {
						"#status": "status",
					},
					ExpressionAttributeValues: {
						":status": "failed",
						":now": new Date().toISOString(),
					},
				})
			);

			return {
				statusCode: 302,
				headers: {
					Location: `${Resource.NEXT_PUBLIC_BASE_URL.value}/payment-failed`,
				},
				body: "",
			};
		}
	} catch (error) {
		console.error("Error handling return:", error);
		return response(500, {
			error: `Error handling return: ${error.message}`,
			message: "Error handling return.",
		});
	}
};

export const handleWebhook = async (event) => {
	try {
		const params = parseBody(event.body);

		const signature = params.signature;
		const { signature: _, ...paramsWithoutSignature } = params;
		const expectedSignature = calculateApsSignature(
			paramsWithoutSignature,
			Resource.APS_SHA_RESPONSE_PHRASE.value
		);

		if (signature !== expectedSignature) {
			return response(400, { error: "Invalid signature" });
		}

		let payment = null;

		if (params.merchant_reference) {
			const queryResult = await dbClient.send(
				new QueryCommand({
					TableName: Resource.Payments.name,
					IndexName: "MerchantRefIndex",
					KeyConditionExpression: "merchantReference = :mr",
					ExpressionAttributeValues: {
						":mr": params.merchant_reference,
					},
				})
			);

			if (queryResult.Items && queryResult.Items.length > 0) {
				payment = queryResult.Items[0];
			}
		}

		if (!payment) {
			return response(404, { error: "Payment not found" });
		}

		const newStatus = params.status === "14" ? "captured" : 
						params.status === "20" ? "tokenized" : "failed";

		await dbClient.send(
			new UpdateCommand({
				TableName: Resource.Payments.name,
				Key: {
					paymentId: payment.paymentId,
					userId: payment.userId,
				},
				UpdateExpression:
					"SET #status = :status, updatedAt = :now",
				ExpressionAttributeNames: {
					"#status": "status",
				},
				ExpressionAttributeValues: {
					":status": newStatus,
					":now": new Date().toISOString(),
				},
			})
		);

		return response(200, { message: "Webhook processed" });
	} catch (error) {
		console.error("Error handling webhook:", error);
		return response(500, {
			error: `Error handling webhook: ${error.message}`,
			message: "Error handling webhook.",
		});
	}
};

export const checkSubscription = async (event) => {
	try {
		const decodedToken = decodeToken(event);
		if (decodedToken.statusCode) {
			return decodedToken;
		}

		const username = decodedToken.username;

		const queryResult = await dbClient.send(
			new QueryCommand({
				TableName: Resource.Payments.name,
				IndexName: "UserIndex",
				KeyConditionExpression: "userId = :userId",
				ExpressionAttributeValues: {
					":userId": username,
				},
				ScanIndexForward: false,
			})
		);

		if (!queryResult.Items || queryResult.Items.length === 0) {
			return response(200, {
				hasActiveSubscription: false,
				subscriptionEnd: null,
				paymentId: null,
			});
		}

		const capturedPayment = queryResult.Items.find(
			(item) => (item.status === "captured" || item.status === "completed") && item.subscriptionEnd
		);

		if (!capturedPayment || !capturedPayment.subscriptionEnd) {
			return response(200, {
				hasActiveSubscription: false,
				subscriptionEnd: null,
				paymentId: null,
			});
		}

		const subscriptionEnd = new Date(capturedPayment.subscriptionEnd);
		const now = new Date();
		const hasActiveSubscription = subscriptionEnd > now;

		return response(200, {
			hasActiveSubscription,
			subscriptionEnd: capturedPayment.subscriptionEnd,
			paymentId: capturedPayment.paymentId,
		});
	} catch (error) {
		console.error("Error checking subscription:", error);
		return response(500, {
			error: `Error checking subscription: ${error.message}`,
			message: "Error checking subscription.",
		});
	}
};