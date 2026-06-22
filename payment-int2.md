# Amazon Payment Services Integration — ECCS Labs

> Plan document for integrating APS (Amazon Payment Services / PayFort) into ECCS Labs for annual subscription payments.

---

## Key Specifications

| Item | Value |
|------|-------|
| **Integration type** | APS Hosted Checkout (PCI-compliant, no card data touches our servers) |
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


PHASE 3: ORDER & PAYMENT
════════════════════════

  9. /order page (student must be logged in)
     - Calls POST /api/payment/checkout (JWT auth)
     - Backend creates APS PURCHASE session, returns form data

  10. Frontend auto-submits hidden <form> to APS Hosted Checkout
      (https://checkout.payfort.com/FortAPI/paymentPage)

  11. Student enters card details on APS-hosted page
      - APS tokenizes card (no card data touches our servers)
      - APS processes payment / 3DS if needed

  12. APS redirects to POST /api/payment/return
      With: fort_id, response_code, status, token_name, agreement_id

  13. Backend validates signature, stores payment record,
      sets subscriptionEnd = now + 1 year → redirects to /dashboard

  14. APS sends async webhook → POST /api/payment/webhook
      - Backend confirms capture status

  15. Dashboard now shows full access (no payment warning)


TEACHER FLOW (unchanged)
════════════════════════

  1. Teacher signs up → Cognito user created
  2. Verifies email → signs in
  3. Dashboard shows full access (no payment needed, no warning)


DIAGRAM
═══════

  Signup → Verify → Login → Dashboard ──→ Pricing → Order → APS Pay → Dashboard
                              │                  ↑         ↑
                              │           (login if needed)  │
                              └── no payment ────────────────┘
```

---

## APS API Reference

| Environment | Hosted Checkout (redirect) | Server API |
|-------------|---------------------------|------------|
| **Sandbox** | `https://sbcheckout.payfort.com/FortAPI/paymentPage` | `https://sbpaymentservices.payfort.com/FortAPI/paymentApi` |
| **Production** | `https://checkout.payfort.com/FortAPI/paymentPage` | `https://paymentservices.payfort.com/FortAPI/paymentApi` |

### Key APS Commands

| Command | Purpose |
|---------|---------|
| `PURCHASE` | One-time charge with auto-capture (used for subscriptions) |
| `AUTHORIZATION` | Hold funds (manual capture later) |
| `CAPTURE` | Capture previously authorized funds |
| `VOID` | Cancel authorization |
| `REFUND` | Refund captured payment |
| `TOKENIZATION` | Tokenize card from client side |

We use **PURCHASE** with `return_url` set to our `/api/payment/return` endpoint.

### APS Authentication

APS uses custom HMAC-SHA256 signature (not bearer tokens):

1. Collect all request parameters (excluding `card_security_code`, `card_number`, `expiry_date`, `card_holder_name`, `remember_me`)
2. Sort alphabetically by parameter name (case-sensitive)
3. Concatenate as `param_name=param_value` pairs (no separators)
4. Wrap with SHA phrase: `{SHA_REQUEST_PHRASE}concatenated_string{SHA_REQUEST_PHRASE}`
5. Hash with SHA-256

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

// JWT-protected route — creates APS checkout for authenticated user
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

// Unauthenticated — APS redirect; validates response signature, stores payment
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
    command, access_code, merchant_identifier,
    merchant_reference, amount, currency, language,
    customer_email, return_url, signature
  }
}

Steps:
1. Decode JWT → get userId and email
2. Verify user exists in Cognito (AdminGetUserCommand)
3. Check user_role — reject if "teacher" (teachers don't pay)
4. Generate unique merchantReference: ECCS-{ts}-{random6}
5. Read SUBSCRIPTION_FEE_AED secret, convert to fils
6. Build APS PURCHASE request params
7. Calculate signature with SHA request phrase
8. Store pending Payment record in DynamoDB (status: "pending")
9. Return { formAction, fields }
```

#### `handleReturn` (no auth — APS redirect)

```
Input: APS POST body (fort_id, merchant_reference, response_code, status, token_name, agreement_id, signature)
Output: { redirectUrl: "/dashboard" } or { redirectUrl: "/payment-failed" }

Steps:
1. Collect APS response parameters
2. Remove signature param, calculate expected signature with SHA response phrase
3. Compare signatures — reject mismatch
4. Find Payment record by merchant_reference
5. If status is "14" (captured) or "01" (authorized):
   a. Update Payment: status → captured, tokenName, agreementId, subscriptionStart, subscriptionEnd
   b. Update Cognito user: add custom:paymentId attribute
   c. Return { redirectUrl: "/dashboard" }
6. If failed:
   a. Update Payment: status → failed
   b. Return { redirectUrl: "/payment-failed?reason=..." }
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
Purpose: Initiate APS Hosted Checkout

Behavior on mount:
1. Call GET /api/payment/status to check for existing subscription
2. If already subscribed → redirect to /dashboard
3. If not subscribed:
   - Show order summary
   - Call POST /api/payment/checkout (JWT auth header)
   - On success, create hidden form and auto-submit to APS
   - Student redirected to APS hosted checkout page

Layout (brief flash before redirect):
┌──────────────────────────────────────────────────────────────┐
│  Order Summary                                               │
│                                                              │
│  Annual Subscription — 100 AED                               │
│                                                              │
│  Redirecting to payment...                                   │
└──────────────────────────────────────────────────────────────┘
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

1. **No card data stored** — APS handles all card input, tokenization, and storage
2. **APS credentials in SST Secrets** — never in code, never committed
3. **Signature validation** on all APS responses and webhooks (SHA response phrase)
4. **HTTPS required** for return_url and notification_url (APS enforces this)
5. **No temporary password storage** — user already exists in Cognito before payment
6. **Idempotent transactions** — `merchantReference` is unique per attempt; prevents duplicate charges
7. **Webhook verification** — validate HMAC signature before processing any status update
8. **No PCI scope** — Hosted Checkout keeps us fully out of PCI compliance requirements
9. **JWT auth on checkout** — only authenticated users can initiate a payment session

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
| 4 | Logged in → clicks "Subscribe" | Redirected to /order |
| 5 | /order → Visa success | Payment stored, redirected to dashboard with full access |
| 6 | /order → 3DS challenge | User passes 3DS, payment captured |
| 7 | /order → card declined | Redirected to /payment-failed |
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
| 5 | `/src/app/(main)/order/page.tsx` | Order page that initiates APS Hosted Checkout |
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

### PURCHASE Request (sent to checkout page)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `command` | `PURCHASE` | One-time charge + auto-capture |
| `access_code` | From secret | APS merchant access code |
| `merchant_identifier` | From secret | APS merchant ID |
| `merchant_reference` | `ECCS-{ts}-{rand}` | Unique per transaction |
| `amount` | `10000` | 100 AED in fils (from SUBSCRIPTION_FEE_AED × 100) |
| `currency` | `AED` | Only AED for now — configurable later |
| `language` | `en` | English |
| `customer_email` | Student email | From Cognito (extracted from JWT) |
| `return_url` | `{BASE_URL}/api/payment/return` | Our backend endpoint |
| `signature` | Calculated | HMAC-SHA256 |

### PURCHASE Response (redirect back to return_url)

| Parameter | Description |
|-----------|-------------|
| `fort_id` | APS transaction ID |
| `merchant_reference` | Our order ID (echoed back) |
| `response_code` | APS response code (e.g., `14000` = success) |
| `response_message` | Human-readable message |
| `status` | `14` = captured/success, `01` = authorized, `11` = declined |
| `token_name` | Card token for recurring charges |
| `agreement_id` | Agreement ID for recurring |
| `signature` | APS-calculated signature (validate with SHA response phrase) |
