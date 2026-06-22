# Amazon Payment Services Integration — ECCS Labs

> Plan document for integrating APS (Amazon Payment Services / PayFort) into ECCS Labs for annual subscription payments.

---

## Key Specifications

| Item | Value |
|------|-------|
| **Integration type** | APS Non-PCI Custom Integration (card form on our domain, tokenization POST to APS, no PCI scope) |
| **Payment timing** | After registration, email verification, and login (separate flow from signup) |
| **Payers** | Students only (teachers bypass payment entirely) |
| **Billing model** | Annual subscription, single tier |
| **Default fee** | 100 AED (configurable via SST Secret `SUBSCRIPTION_FEE_AED`) |
| **Currency** | AED (amount in fils: 100 × 100 = `10000`) |
| **Renewal** | APS auto-renewal via stored `token_name` + `agreement_id` |
| **Trial** | None |
| **Domain** | Route53 hosted zone in AWS |
| **Environment** | SST ION on AWS (Lambda + DynamoDB + API Gateway V2) |

---

## Registration & Payment Flow

```
PHASE 1: REGISTRATION (unchanged from current flow)
═════════════════════════════════════════════════════

  1. Student fills signup form (firstName, lastName, email, password)
  2. POST /api/auth/signup → creates Cognito user (unverified)
  3. Cognito sends verification email
  4. Student clicks link in email → email verified
  5. Student signs in → lands on /dashboard

  Dashboard shows:
  ┌────────────────────────────────────────────────────────────┐
  │  Welcome to ECCS Labs                                      │
  │                                                            │
  │  ⚠ You haven't subscribed yet.                             │
  │  Subscribe to access case studies and earn certificates.    │
  │  [Go to Pricing →]                                         │
  └────────────────────────────────────────────────────────────┘


PHASE 2: PRICING PAGE
═════════════════════

  6. Student clicks "Go to Pricing" → /pricing
  7. /pricing shows one plan:
     ┌──────────────────────────────────────┐
     │  Annual Subscription                 │
     │  100 AED / year                      │
     │  [Subscribe]                         │
     └──────────────────────────────────────┘
  8. Click "Subscribe":
     - If NOT logged in → redirect to /login
     - After login → redirect to /order
     - If ALREADY logged in → redirect to /order


PHASE 3: ORDER & PAYMENT (Custom Non-PCI)
══════════════════════════════════════

  9. /order page (student must be logged in)
     - Calls POST /api/payment/checkout (JWT auth)
     - Backend generates TOKENIZATION request params + signature
       (excluding card data — card_number, expiry_date, card_security_code
        are NOT in signature params)
     - Returns: formAction (APS paymentPage URL), tokenization fields

  10. Student fills card form on /order:
      ┌──────────────────────────────────────┐
      │  Card Number   [________________]    │
      │  Expiry (MM/YY) [______]  CVV [___]  │
      │  Cardholder Name [________________]  │
      │                                      │
      │  [Pay 100 AED — Subscribe]           │
      └──────────────────────────────────────┘

  11. On submit, frontend builds hidden form merging:
      - Backend-provided fields (merchant_identifier, access_code,
        service_command=TOKENIZATION, language, return_url,
        merchant_reference, signature)
      - Card data from user input (card_number, expiry_date,
        card_security_code, card_holder_name)
      Form auto-submits to APS https://checkout.payfort.com/FortAPI/paymentPage
      → Browser POSTs to APS (brief navigation)

  12. APS tokenizes card, redirects browser to POST /api/payment/return
      With: token_name, fort_id (placeholder), response_code, status,
             merchant_reference, signature
      Status 18 = tokenization success, 11 = failure

  13. Backend validates signature, checks status:
      - If `status = 18` (tokenization success):
        a. Call server-to-server PURCHASE to paymentApi with token_name
           (POST https://paymentservices.payfort.com/FortAPI/paymentApi)
        b. If PURCHASE response includes `3ds_url`:
           → Return 302 redirect to 3DS URL
           → User authenticates with bank
           → APS redirects back to /api/payment/return with final result
        c. If PURCHASE success (status 14):
           Store payment record, update Cognito with paymentId,
           set subscriptionEnd = now + 1 year
        d. Return redirect to /dashboard
      - If `status = 11` (tokenization failure):
        → Return redirect to /payment-failed

  14. Dashboard now shows full access (no payment warning)

  Note: Card data is submitted directly from browser to APS via form POST.
        It never touches our backend servers. The server-side PURCHASE uses
        the token_name (not card data), keeping us out of PCI scope.


TEACHER FLOW (unchanged)
════════════════════════

  1. Teacher signs up → Cognito user created
  2. Verifies email → signs in
  3. Dashboard shows full access (no payment needed, no warning)


DIAGRAM
═══════

  Signup → Verify → Login → Dashboard ──→ Pricing → Order ─→ APS Tokenize ─→ return
                              │                  ↑            (POST form,      │
                              │           (login if needed)   brief nav)      │
                              └── no payment ────────────────────────────────┘
                                                                              │
                                                              ← 3DS (if needed)│
                                                              → /dashboard ◄──┘
```

---

## APS API Reference

| Environment | Tokenization endpoint (form POST) | Payment API |
|-------------|---------------------------|------------|
| **Sandbox** | `https://sbcheckout.payfort.com/FortAPI/paymentPage` | `https://sbpaymentservices.payfort.com/FortAPI/paymentApi` |
| **Production** | `https://checkout.payfort.com/FortAPI/paymentPage` | `https://paymentservices.payfort.com/FortAPI/paymentApi` |

### Key APS Commands

| Command | Purpose |
|---------|---------|
| `TOKENIZATION` | Tokenize card from client side (browser POST to paymentPage) |
| `PURCHASE` | One-time charge with auto-capture (server-to-server to paymentApi) |
| `AUTHORIZATION` | Hold funds (manual capture later) |
| `CAPTURE` | Capture previously authorized funds |
| `VOID` | Cancel authorization |
| `REFUND` | Refund captured payment |

We use:
- **TOKENIZATION** — browser POST to paymentPage (client-side, card data straight to APS)
- **PURCHASE** with `token_name` — server-to-server POST to paymentApi (after successful tokenization)

### APS Authentication

APS uses custom HMAC-SHA256 signature (not bearer tokens):

1. Collect all request parameters (excluding `card_security_code`, `card_number`, `expiry_date`, `card_holder_name`, `remember_me`)
2. Sort alphabetically by parameter name (case-sensitive)
3. Concatenate as `param_name=param_value` pairs (no separators)
4. Wrap with SHA phrase: `{SHA_REQUEST_PHRASE}concatenated_string{SHA_REQUEST_PHRASE}`
5. Hash with SHA-256

**Important for Non-PCI**: Backend computes the signature for TOKENIZATION without card data (since those fields are excluded from signing). Frontend adds card data to the form after receiving the signature — card data never touches the backend.

---

## Infrastructure Changes (SST ION)

### New File: `/infra/payment.ts`

```ts
/// <reference path="../.sst/platform/config.d.ts" />

import {
  APS_ACCESS_CODE,
  APS_MERCHANT_IDENTIFIER,
  APS_SHA_REQUEST_PHRASE,
  APS_SHA_RESPONSE_PHRASE,
  SUBSCRIPTION_FEE_AED,
} from "./secrets";
import { userPool, eccsWebClient } from "./auth";
import { api } from "./api";

export const Payments = new sst.aws.Dynamo("Payments", {
  fields: {
    paymentId: "string",           // APS fort_id (PK)
    userId: "string",              // Cognito sub (SK)
    merchantReference: "string",   // Our unique order ID
    status: "string",              // pending | authorized | captured | failed | refunded
    tokenName: "string",           // APS token for recurring charges
    agreementId: "string",         // APS agreement for recurring
    amount: "number",              // Amount in fils (10000 = 100 AED)
    currency: "string",            // "AED"
    customerEmail: "string",       // Student email (for record keeping)
    subscriptionStart: "string",   // ISO date
    subscriptionEnd: "string",     // ISO date (start + 1 year)
    createdAt: "string",
    updatedAt: "string",
  },
  primaryIndex: { hashKey: "paymentId", rangeKey: "userId" },
  globalIndexes: {
    UserIndex: { hashKey: "userId", rangeKey: "createdAt" },
    EmailIndex: { hashKey: "customerEmail" },
    MerchantRefIndex: { hashKey: "merchantReference" },
    StatusIndex: { hashKey: "status", rangeKey: "createdAt" },
  },
});

// JWT-protected route — generates TOKENIZATION params for authenticated user
// Returns APS paymentPage URL + form fields (excluding card data)
api.route("POST /api/payment/checkout", {
  handler: "server/controllers/payment.createCheckout",
  link: [
    Payments,
    APS_ACCESS_CODE,
    APS_MERCHANT_IDENTIFIER,
    APS_SHA_REQUEST_PHRASE,
    SUBSCRIPTION_FEE_AED,
  ],
});

// Unauthenticated — APS redirect (tokenization result + eventual 3DS/purchase result)
// 1. Receives tokenization redirect from APS (status 18)
// 2. Calls server-to-server PURCHASE with token_name
// 3. If 3DS needed → redirects to 3ds_url → APS comes back here
// 4. If success → redirects to /dashboard
api.route("POST /api/payment/return", {
  handler: "server/controllers/payment.handleReturn",
  link: [
    Payments,
    userPool,
    eccsWebClient,
    APS_SHA_RESPONSE_PHRASE,
    APS_SHA_REQUEST_PHRASE,
    SUBSCRIPTION_FEE_AED,
  ],
});

// Unauthenticated — APS webhook; validates signature, updates payment status
api.route("POST /api/payment/webhook", {
  handler: "server/controllers/payment.handleWebhook",
  link: [Payments, APS_SHA_RESPONSE_PHRASE],
});

// JWT-protected — check subscription status for current user
const routeArgs = {
  auth: {
    jwt: {
      authorizer: cognitoAuthorizer.id,
    },
  },
};

api.route("GET /api/payment/status", {
  handler: "server/controllers/payment.checkSubscription",
  link: [Payments],
}, routeArgs);
```

### File to Modify: `/sst.config.ts`

Add to the `run()` function:

```ts
await import("./infra/payment");
```

Place after the existing imports (order matters for resource references).

### File to Modify: `/infra/secrets.ts`

Add these exports:

```ts
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
```

### File to Modify: `/infra/auth.ts`

Add to the `schemas` array in the Cognito User Pool transform:

```ts
{
  name: "paymentId",
  attributeDataType: "String",
  developerOnlyAttribute: false,
  mutable: true,
  required: false,
},
```

### File to Modify: `/infra/api.ts`

Add `Payments` to the `links` array at the top, and import it alongside the other Dynamo tables:

```ts
import { Feedback, StudentsResponses, TeacherCaseStudies, Payments } from "./dynamo";
```

---

## Backend Implementation

### New File: `/server/utils/aps-signature.js`

```js
import crypto from "crypto";

export function calculateApsSignature(params, shaPhrase) {
  const sortedKeys = Object.keys(params).sort();
  const concatenated = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("");
  const stringToHash = `${shaPhrase}${concatenated}${shaPhrase}`;
  return crypto.createHash("sha256").update(stringToHash).digest("hex");
}

export function aedToFils(aed) {
  return String(Math.round(Number(aed) * 100));
}
```

### New File: `/server/controllers/payment.js`

#### `createCheckout` (JWT auth)

```
Input:  JWT token (userId, email extracted from token)
Output: {
  formAction: "https://checkout.payfort.com/FortAPI/paymentPage",
  fields: {
    service_command: "TOKENIZATION",
    access_code, merchant_identifier, language,
    merchant_reference, return_url, signature
    // NOTE: card_number, expiry_date, card_security_code, card_holder_name
    // are NOT returned — frontend adds them from user input
  }
}

Steps:
1. Decode JWT → get userId and email
2. Verify user exists in Cognito (AdminGetUserCommand)
3. Check user_role — reject if "teacher" (teachers don't pay)
4. Generate unique merchantReference: ECCS-{ts}-{random6}
5. Build APS TOKENIZATION request params (no card data, no amount)
6. Calculate signature with SHA request phrase
   (card fields excluded from signature calc — correct for APS)
7. Store pending Payment record in DynamoDB (status: "pending")
8. Return { formAction, fields }
```

#### `handleReturn` (no auth — APS redirect)

This endpoint is reached in two scenarios:
1. **After tokenization** — browser lands here after APS tokenization form POST
2. **After 3DS** — browser lands here after user completes 3DS challenge

The handler differentiates by checking which parameters are present.

```
Scenario A: Tokenization result (has token_name, status 18, no fort_id)

Input: APS POST body (token_name, merchant_reference, response_code, status, signature)
Steps:
1. Collect APS response parameters
2. Validate signature with SHA response phrase
3. Find Payment record by merchant_reference
4. If status is NOT 18 (tokenization failed):
   → Update Payment: status → failed
   → Return 302 redirect to /payment-failed
5. If status is 18 (tokenization success):
   a. Store token_name on Payment record
   b. Call server-to-server PURCHASE to paymentApi:
      POST https://paymentservices.payfort.com/FortAPI/paymentApi
      Params: command=PURCHASE, access_code, merchant_identifier,
              merchant_reference, amount (in fils), currency=AED,
              customer_email, token_name, language=en,
              return_url={BASE_URL}/api/payment/return,
              signature (calculated with SHA request phrase)
   c. Check PURCHASE response:
      - If response has 3ds_url → Return 302 redirect to 3ds_url
        (user will complete 3DS, APS redirects back to this same endpoint)
      - If status = 14 (captured):
        → Update Payment: status=captured, fort_id, agreementId,
          subscriptionStart, subscriptionEnd
        → Update Cognito user: add custom:paymentId attribute
        → Return 302 redirect to /dashboard
      - If status != 14 (failed):
        → Update Payment: status=failed
        → Return 302 redirect to /payment-failed


Scenario B: Post-3DS purchase result (has fort_id, response_code, status, token_name)

Input: APS POST body (fort_id, merchant_reference, response_code, status, token_name, agreement_id, signature)
Steps:
1. Collect APS response parameters
2. Validate signature with SHA response phrase
3. Find Payment record by merchant_reference
4. If status is "14" (captured) or "01" (authorized):
   a. Update Payment: status=captured, fort_id, tokenName, agreementId,
      subscriptionStart, subscriptionEnd
   b. Update Cognito user: add custom:paymentId attribute
   c. Return 302 redirect to /dashboard
5. If failed:
   a. Update Payment: status → failed
   b. Return 302 redirect to /payment-failed
```

#### `handleWebhook` (no auth — APS server notification)

```
Input: APS POST body (transaction status update)
Output: 200 OK

Steps:
1. Validate webhook signature with SHA response phrase
2. Find Payment record by merchant_reference or fort_id
3. Update payment status if changed
4. If newly captured, confirm subscriptionEnd date
5. Return 200 OK
```

#### `checkSubscription` (JWT auth)

```
Input: JWT token
Output: { hasActiveSubscription, subscriptionEnd, paymentId }

Steps:
1. Decode JWT → get userId
2. Query Payments table by UserIndex (userId)
3. Find most recent payment with status === "captured"
4. Check if subscriptionEnd > now
5. Return subscription status
```

### No Changes to Auth Controller

The existing `/server/controllers/auth.js` signup handler stays **completely unchanged**. Registration is independent of payment.

---

## Frontend Changes

### Signup Form — No Changes

The existing signup form (`/src/presentation/auth/signup/components/form.tsx`) stays **completely unchanged**. Students sign up as before — no payment during registration.

### New Page: `/src/app/(main)/pricing/page.tsx`

```
Route:  /pricing (public — no auth required)
Purpose: Show subscription plan, trigger payment flow

Layout:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Pricing                                                         │
│                                                                  │
│  ┌──────────────────────────────────────┐                        │
│  │  Annual Subscription                 │                        │
│  │                                      │                        │
│  │  100 AED / year                      │                        │
│  │                                      │                        │
│  │  [Subscribe]                         │                        │
│  │                                      │                        │
│  │  • Access all case studies           │                        │
│  │  • Submit responses                  │                        │
│  │  • Earn certificates                 │                        │
│  │  • Annual renewal                    │                        │
│  └──────────────────────────────────────┘                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

On "Subscribe" click:
  If NOT logged in → router.push("/login?redirect=/order")
  If logged in    → router.push("/order")
```

### New Page: `/src/app/(main)/order/page.tsx`

```
Route:  /order (auth required — redirects to /login if not authenticated)
Purpose: Show card form, initiate APS tokenization

Behavior on mount:
1. Call GET /api/payment/status to check for existing subscription
2. If already subscribed → redirect to /dashboard
3. If not subscribed → show card form

Card form follows the APS "Create Payment Form" structure (visible + hidden form pattern),
styled with the same `InputField` and `Button` components as the signup form:

```tsx
import { FC, FormEvent, useState } from "react";
import { InputField } from "@/components/form-elements";
import { Button } from "@/components/ui/main-button";

interface CardData {
  card_number: string;
  expiry_date: string;
  card_security_code: string;
  card_holder_name: string;
}

interface TokenizationFields {
  service_command: string;
  access_code: string;
  merchant_identifier: string;
  language: string;
  merchant_reference: string;
  return_url: string;
  signature: string;
}

export const OrderForm: FC = () => {
  const [cardData, setCardData] = useState<CardData>({
    card_number: "",
    expiry_date: "",
    card_security_code: "",
    card_holder_name: "",
  });
  const [errors, setErrors] = useState<Partial<CardData>>({});
  const [tokenFields, setTokenFields] = useState<TokenizationFields | null>(null);
  const [loading, setLoading] = useState(false);

  const isFormValid = Object.values(cardData).every(Boolean);

  // Fields excluded from APS signature — backend computes sig without them,
  // frontend merges them into the hidden tokenization form at submit time
  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    // Step 1: Get tokenization params from backend (no card data sent)
    const res = await fetch("/api/payment/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthCookie()}` },
    });
    const { formAction, fields } = await res.json();
    // fields: service_command, access_code, merchant_identifier,
    //        language, merchant_reference, return_url, signature

    // Step 2: Build hidden form with backend params + card data
    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = formAction;

    const allParams = {
      ...fields,
      card_number: cardData.card_number,
      expiry_date: cardData.expiry_date,
      card_security_code: cardData.card_security_code,
      card_holder_name: cardData.card_holder_name,
    };

    Object.entries(allParams).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value as string;
      hiddenForm.appendChild(input);
    });

    // Step 3: Submit — browser POSTs to APS, redirects to return_url
    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
  };

  return (
    <>
      {/* Visible card form (Create Payment Form pattern) */}
      <form id="paymentForm" onSubmit={handlePay} className="mt-5">
        <InputField
          label="Card Number"
          name="card_number"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          value={cardData.card_number}
          onChange={(e) =>
            setCardData({ ...cardData, card_number: e.target.value })
          }
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField
            label="Expiry Date"
            name="expiry_date"
            placeholder="MM/YY"
            maxLength={5}
            value={cardData.expiry_date}
            onChange={(e) =>
              setCardData({ ...cardData, expiry_date: e.target.value })
            }
            required
          />
          <InputField
            label="CVV"
            name="card_security_code"
            placeholder="123"
            maxLength={4}
            value={cardData.card_security_code}
            onChange={(e) =>
              setCardData({ ...cardData, card_security_code: e.target.value })
            }
            required
          />
        </div>
        <InputField
          label="Cardholder Name"
          name="card_holder_name"
          placeholder="John Doe"
          value={cardData.card_holder_name}
          onChange={(e) =>
            setCardData({ ...cardData, card_holder_name: e.target.value })
          }
          required
        />
        <p className="mt-4 text-xs text-grey-300">
          Your card data is sent directly to Amazon Payment Services.
          We never see or store your card details.
        </p>
        <div className="mt-8">
          <Button
            variant="basic"
            size="lg"
            block
            disabled={!isFormValid || loading}
          >
            {loading ? "Processing..." : "Pay 100 AED — Subscribe"}
          </Button>
        </div>
      </form>

      {/* Hidden tokenization form — populated and auto-submitted on pay */}
      <form
        action="https://checkout.payfort.com/FortAPI/paymentPage"
        method="POST"
        id="tokenizationForm"
        style={{ display: "none" }}
      />
    </>
  );
};
```
```

### New Page: `/src/app/(auth)/payment-success/page.tsx`

- Display: "Payment successful! Welcome to ECCS Labs."
- Button: "Go to Dashboard" → redirect to `/dashboard`
- After 5 seconds, auto-redirect to `/dashboard`

### New Page: `/src/app/(auth)/payment-failed/page.tsx`

- Display: "Payment failed. Please try again."
- Reason from query params if available
- Button: "Try Again" → redirect to `/order`
- Button: "Go to Dashboard" → redirect to `/dashboard`

### File to Modify: Dashboard component

```
On mount (or on load):
  1. Get current user from auth state
  2. If user_role === "teacher" → show full dashboard (no change)
  3. If user_role === "student":
     a. Call GET /api/payment/status
     b. If hasActiveSubscription → show full dashboard
     c. If no subscription → show warning banner:
        ┌────────────────────────────────────────────────────┐
        │ ⚠ You haven't subscribed yet. Subscribe to        │
        │ access case studies and earn certificates.         │
        │ [Go to Pricing →]                                 │
        └────────────────────────────────────────────────────┘
```

### File to Modify: `/src/services/apis/payment.ts` (new service file)

```ts
import { authApi } from "../config/fetchClient";
import { configureRequestHeaders } from "../config/fetchClient";
import { getAuthCookie } from "@/utils/cookies";

export const createPaymentCheckout = async () => {
  const cookieData = getAuthCookie();
  return authApi.post(
    "/checkout",
    { user_role: "student" },
    configureRequestHeaders(),
  );
};

export const checkSubscriptionStatus = async () => {
  const cookieData = getAuthCookie();
  return authApi.get("/status", configureRequestHeaders());
};
```

---

## DynamoDB Table: `Payments`

### Schema

| Attribute | Type | Key | Description |
|-----------|------|-----|-------------|
| `paymentId` | string | PK (HASH) | APS `fort_id` — set after payment completes |
| `userId` | string | SK (RANGE) | Cognito sub (student) |
| `merchantReference` | string | — | Our unique order ID, used for GSIs & idempotency |
| `status` | string | — | `pending` → `authorized` → `captured` / `failed` |
| `tokenName` | string | — | APS token for recurring charges |
| `agreementId` | string | — | APS agreement ID for recurring |
| `amount` | number | — | Amount in fils (10000 = 100 AED) |
| `currency` | string | — | `AED` |
| `customerEmail` | string | — | Student email (record keeping) |
| `subscriptionStart` | string | — | ISO date when subscription starts |
| `subscriptionEnd` | string | — | ISO date when subscription expires (start + 1 year) |
| `createdAt` | string | — | ISO creation timestamp |
| `updatedAt` | string | — | ISO update timestamp |

### Global Secondary Indexes

| GSI Name | Hash Key | Range Key | Purpose |
|----------|----------|-----------|---------|
| `UserIndex` | `userId` | `createdAt` | Query payment history for a user |
| `EmailIndex` | `customerEmail` | — | Find payments by email |
| `MerchantRefIndex` | `merchantReference` | — | Lookup by our order ID (idempotency) |
| `StatusIndex` | `status` | `createdAt` | Find pending/expiring subscriptions |

---

## Security Considerations

1. **No card data stored** — Card data POSTs directly from browser to APS; never touches our servers
2. **APS credentials in SST Secrets** — never in code, never committed
3. **Signature validation** on all APS responses and webhooks (SHA response phrase)
4. **HTTPS required** for return_url and notification_url (APS enforces this)
5. **No temporary password storage** — user already exists in Cognito before payment
6. **Idempotent transactions** — `merchantReference` is unique per attempt; prevents duplicate charges
7. **Webhook verification** — validate HMAC signature before processing any status update
8. **No PCI scope** — Card data flows directly from browser to APS via form POST.
   Our backend only handles `token_name` (opaque token), not raw card data.
9. **JWT auth on checkout** — only authenticated users can initiate a payment session
10. **Card fields excluded from signature** — `card_number`, `expiry_date`,
    `card_security_code`, `card_holder_name` are not part of APS signature calculation.
    Backend computes the signature without ever receiving card data.

---

## Testing Strategy

### APS Sandbox Credentials

Register at [https://sandbox.payfort.com](https://sandbox.payfort.com) to obtain:

| Credential | Description |
|------------|-------------|
| Sandbox Access Code | Merchant access identifier |
| Sandbox Merchant Identifier | Merchant account routing ID |
| Sandbox SHA Request Phrase | Secret for signing requests |
| Sandbox SHA Response Phrase | Secret for validating responses |

### Test Cards

| Card | Number | Expiry | CVC | Expected Result |
|------|--------|--------|-----|-----------------|
| Visa Success | `4005550000000001` | 05/30 | 123 | Approved |
| MasterCard Success | `5123456789012346` | 05/30 | 123 | Approved |
| AMEX Success | `345678901234564` | 05/30 | 1234 | Approved |
| Visa 3DS | `4557012345678902` | 05/30 | 123 | 3DS challenge |
| MasterCard 3DS | `5313581000123430` | 05/30 | 123 | 3DS challenge |
| Visa Declined | `4916783391760242` | 05/30 | 123 | Declined |

### Test Cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Student signs up, verifies email, signs in | Dashboard shows payment warning |
| 2 | Student clicks "Go to Pricing" | /pricing page displays one plan |
| 3 | Not logged in → clicks "Subscribe" | Redirected to /login |
| 4 | Logged in → clicks "Subscribe" | Redirected to /order (card form shown) |
| 5 | /order → fill card → Visa success | Card form POSTs to APS, token returned, PURCHASE succeeds, redirected to dashboard |
| 6 | /order → fill card → 3DS challenge | Token + PURCHASE returns 3ds_url, user authenticates, payment captured |
| 7 | /order → fill card → declined | APS returns tokenization fail, redirected to /payment-failed |
| 8 | Already subscribed → visits /order | Redirected to /dashboard |
| 9 | Teacher signs in | Dashboard shows full access (no payment check) |
| 10 | Duplicate payment attempt | Idempotency prevents double charge |

---

## Implementation Order

| Phase | Tasks | Dependencies | Est. Effort |
|-------|-------|--------------|-------------|
| **Phase 1: Infrastructure** | Create `Payments` DynamoDB table, APS secrets, add API routes, add Cognito `paymentId` attribute | None | Small |
| **Phase 2: Backend Utils** | Create `/server/utils/aps-signature.js` — signature calculator + aedToFils | None | Small |
| **Phase 3: Backend Handlers** | Create `/server/controllers/payment.js` — createCheckout, handleReturn, handleWebhook, checkSubscription | Phase 1 + 2 | Medium |
| **Phase 4: Frontend Pages** | Create `/pricing`, `/order`, `/payment-success`, `/payment-failed` pages | None | Medium |
| **Phase 5: Dashboard** | Add payment status check + warning banner for unpaid students | Phase 3 | Small |
| **Phase 6: Integration Testing** | End-to-end test with APS sandbox | Phase 1–5 | Medium |
| **Phase 7: Go-Live** | APS integration sign-off, set production secrets in SST, deploy | Phase 6 | Small |

---

## Complete File Inventory

### New Files (8)

| # | File | Purpose |
|---|------|---------|
| 1 | `/infra/payment.ts` | Payments DynamoDB table, API routes, secret links |
| 2 | `/server/utils/aps-signature.js` | APS HMAC-SHA256 signature calculator |
| 3 | `/server/controllers/payment.js` | createCheckout, handleReturn, handleWebhook, checkSubscription |
| 4 | `/src/app/(main)/pricing/page.tsx` | Pricing page with "Subscribe" button |
| 5 | `/src/app/(main)/order/page.tsx` | Card form page that performs APS tokenization POST |
| 6 | `/src/app/(auth)/payment-success/page.tsx` | Post-payment success landing page |
| 7 | `/src/app/(auth)/payment-failed/page.tsx` | Post-payment failure landing page |
| 8 | `/src/services/apis/payment.ts` | Payment API functions |

### Modified Files (7)

| # | File | Change |
|---|------|--------|
| 1 | `/sst.config.ts` | Add `await import("./infra/payment")` |
| 2 | `/infra/secrets.ts` | Add 5 new SST Secrets (APS credentials + SUBSCRIPTION_FEE_AED) |
| 3 | `/infra/auth.ts` | Add `paymentId` custom attribute to Cognito schema |
| 4 | `/infra/api.ts` | Import `Payments` table, add payment routes to links array |
| 5 | `/infra/payment.ts` | Unauthenticated: return + webhook, JWT: checkout + status |
| 6 | Dashboard component | Add payment status check + warning banner for unpaid students |
| 7 | _Login page_ | Accept `?redirect=/order` param to redirect after login |

### Files That Stay Unchanged

| File | Reason |
|------|--------|
| `/server/controllers/auth.js` | Registration is independent of payment |
| `/src/presentation/auth/signup/components/form.tsx` | No payment during signup |
| `/src/store/slices/auth/signupSlice.ts` | No payment during signup |

---

## APS Parameters Reference

### TOKENIZATION Request (browser POST to paymentPage)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `service_command` | `TOKENIZATION` | Tokenize card (no charge) |
| `access_code` | From secret | APS merchant access code |
| `merchant_identifier` | From secret | APS merchant ID |
| `merchant_reference` | `ECCS-{ts}-{rand}` | Unique per tokenization attempt |
| `language` | `en` | English |
| `return_url` | `{BASE_URL}/api/payment/return` | Our return endpoint |
| `card_number` | From user input | Full PAN — NOT in signature |
| `expiry_date` | From user input | YYMM format — NOT in signature |
| `card_security_code` | From user input | CVV/CVC — NOT in signature |
| `card_holder_name` | From user input | NOT in signature |
| `signature` | Calculated (backend) | HMAC-SHA256 — excludes card fields |

### TOKENIZATION Response (redirect to return_url)

| Parameter | Description |
|-----------|-------------|
| `merchant_reference` | Echoed back from request |
| `token_name` | Card token for subsequent PURCHASE |
| `response_code` | APS response code (e.g., `18000` = success) |
| `response_message` | Human-readable message |
| `status` | `18` = success, `11` = failed |
| `card_bin` | First 6 digits of card |
| `card_number` | Masked PAN (`455701******8902`) |
| `expiry_date` | Echoed back |
| `card_holder_name` | Echoed back |
| `signature` | APS-calculated (validate with SHA response phrase) |

### PURCHASE Request (server-to-server to paymentApi)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `command` | `PURCHASE` | One-time charge + auto-capture |
| `access_code` | From secret | APS merchant access code |
| `merchant_identifier` | From secret | APS merchant ID |
| `merchant_reference` | Same as tokenization | Must match (idempotency) |
| `amount` | `10000` | 100 AED in fils (from SUBSCRIPTION_FEE_AED × 100) |
| `currency` | `AED` | Only AED for now |
| `language` | `en` | English |
| `customer_email` | Student email | From Cognito |
| `token_name` | From tokenization | APS card token |
| `return_url` | `{BASE_URL}/api/payment/return` | For 3DS redirect |
| `signature` | Calculated (backend) | HMAC-SHA256 |

### PURCHASE Response (server-to-server JSON)

| Parameter | Description |
|-----------|-------------|
| `fort_id` | APS transaction ID |
| `merchant_reference` | Echoed back |
| `response_code` | `14000` = success, `20064` = 3DS needed, etc. |
| `status` | `14` = captured, `01` = authorized, `11` = declined |
| `token_name` | Card token (for recurring) |
| `agreement_id` | Agreement ID (for recurring) |
| `3ds_url` | Present if 3DS authentication needed |
| `signature` | APS-calculated (validate with SHA response phrase) |

### PURCHASE 3DS Redirect (after 3DS → return_url)

Same parameters as PURCHASE response above, passed as POST body to
the return_url. Backend validates signature and checks status.
