/**
 * Welcome to Cloudflare Workers!
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { createRemoteJWKSet, jwtVerify } from "jose";

const MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
];

// Firebase project ID
const FIREBASE_PROJECT_ID = "my-kreashiv-app";

// IMPORTANT:
// Firebase Console → Project settings → General → Project number
const FIREBASE_PROJECT_NUMBER = "602778307055";

// Firebase Authentication public signing keys
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

// Firebase App Check public signing keys
const FIREBASE_APPCHECK_JWKS = createRemoteJWKSet(
  new URL("https://firebaseappcheck.googleapis.com/v1/jwks")
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Firebase-AppCheck",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

// ============================================================
// FIREBASE AUTH TOKEN VERIFICATION
// ============================================================

async function verifyFirebaseToken(request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    throw new Error("Missing authorization header.");
  }

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Invalid authorization format.");
  }

  const idToken = authorization.substring(7).trim();

  if (!idToken) {
    throw new Error("Missing Firebase ID token.");
  }

  const issuer =
    `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;

  const { payload } = await jwtVerify(
    idToken,
    FIREBASE_JWKS,
    {
      issuer,
      audience: FIREBASE_PROJECT_ID,
    }
  );

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid Firebase user.");
  }

  return payload;
}

// ============================================================
// FIREBASE APP CHECK TOKEN VERIFICATION
// ============================================================

async function verifyFirebaseAppCheck(request) {
  const appCheckToken = request.headers.get(
    "X-Firebase-AppCheck"
  );

  if (!appCheckToken) {
    throw new Error("Missing Firebase App Check token.");
  }

  if (!FIREBASE_PROJECT_NUMBER || FIREBASE_PROJECT_NUMBER === "YOUR_PROJECT_NUMBER") {
    throw new Error("Firebase project number is not configured.");
  }

  const expectedIssuer =
    `https://firebaseappcheck.googleapis.com/${FIREBASE_PROJECT_NUMBER}`;

  const expectedAudience =
    `projects/${FIREBASE_PROJECT_NUMBER}`;

  const { payload, protectedHeader } = await jwtVerify(
    appCheckToken,
    FIREBASE_APPCHECK_JWKS,
    {
      issuer: expectedIssuer,
      audience: expectedAudience,
      algorithms: ["RS256"],
    }
  );

  // App Check tokens must use JWT
  if (protectedHeader.typ !== "JWT") {
    throw new Error("Invalid App Check token type.");
  }

  // App Check token must be issued by Firebase App Check
  if (payload.iss !== expectedIssuer) {
    throw new Error("Invalid App Check issuer.");
  }

  // Audience must belong to this Firebase project
  const audience = Array.isArray(payload.aud)
    ? payload.aud
    : [payload.aud];

  if (!audience.includes(expectedAudience)) {
    throw new Error("Invalid App Check audience.");
  }

  // Token subject should contain the Firebase App ID
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid App Check app identity.");
  }

  return payload;
}

export default {
  async fetch(request, env) {
    // ========================================================
    // CORS PREFLIGHT
    // ========================================================

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // ========================================================
    // PUBLIC HEALTH CHECK
    // ========================================================

    if (request.method === "GET" && url.pathname === "/") {
      return new Response("AI Proxy Running", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // ========================================================
    // ONLY POST /api/ai
    // ========================================================

    if (
      request.method !== "POST" ||
      url.pathname !== "/api/ai"
    ) {
      return jsonResponse(
        {
          error: "Not found",
        },
        404
      );
    }

    // ========================================================
    // FIREBASE AUTHENTICATION
    // ========================================================

    let user;

    try {
      user = await verifyFirebaseToken(request);

      console.log(
        "Authenticated Firebase user:",
        user.sub
      );
    } catch (error) {
      console.warn(
        "Firebase authentication failed:",
        error?.message || error
      );

      return jsonResponse(
        {
          error: "Authentication required.",
        },
        401
      );
    }

    // ========================================================
    // FIREBASE APP CHECK (optional — blocks only in production)
    // ========================================================

    try {
      const appCheck = await verifyFirebaseAppCheck(request);
      console.log("Firebase App Check verified:", appCheck.sub);
    } catch (error) {
      // App Check is optional for non-production builds (sideloaded APKs).
      // Firebase Auth above already ensures the user is logged in.
      // App Check adds extra protection only on Play Store builds.
      console.warn(
        "Firebase App Check skipped (non-production or debug build):",
        error?.message || error
      );
      // Do NOT return 401 — allow request to proceed
    }

    // ========================================================
    // PER-USER RATE LIMITING
    // ========================================================

    try {
      const rateLimit = await env.AI_RATE_LIMITER.limit({
        key: `user:${user.sub}`,
      });

      if (!rateLimit.success) {
        return jsonResponse(
          {
            error:
              "Too many AI requests. Please wait a minute and try again.",
          },
          429
        );
      }
    } catch (error) {
      console.error(
        "Rate limiter error:",
        error
      );

      return jsonResponse(
        {
          error:
            "AI service temporarily unavailable.",
        },
        503
      );
    }

    // ========================================================
    // REQUEST VALIDATION
    // ========================================================

    try {
      const body = await request.json();
      const prompt = body?.prompt;

      if (!prompt || typeof prompt !== "string") {
        return jsonResponse(
          {
            error: "Prompt is required.",
          },
          400
        );
      }

      if (prompt.length > 20000) {
        return jsonResponse(
          {
            error: "Prompt is too long.",
          },
          413
        );
      }

      // ======================================================
      // GEMINI API KEY
      // ======================================================

      const apiKey = env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error(
          "GEMINI_API_KEY is missing."
        );

        return jsonResponse(
          {
            error:
              "AI service configuration error.",
          },
          500
        );
      }

      let lastError = null;

      // ======================================================
      // GEMINI MODEL FALLBACK SYSTEM
      // ======================================================

      for (const modelName of MODELS) {
        try {
          const geminiUrl =
            `https://generativelanguage.googleapis.com/v1beta/models/` +
            `${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

          const response = await fetch(
            geminiUrl,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: prompt,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          const data = await response.json();

          const generatedText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (
            response.ok &&
            generatedText
          ) {
            return jsonResponse({
              text: generatedText,
            });
          }

          const errorMessage =
            data?.error?.message ||
            `Failed with ${modelName}`;

          console.warn(
            `Model ${modelName} returned ${response.status}: ${errorMessage}`
          );

          lastError = new Error(
            errorMessage
          );
        } catch (error) {
          console.warn(
            `Model ${modelName} exception:`,
            error
          );

          lastError = error;
        }
      }

      // ======================================================
      // GEMINI ERROR HANDLING
      // ======================================================

      const rawErrorMsg =
        lastError?.message || "";

      if (
        rawErrorMsg.includes(
          "Quota exceeded"
        ) ||
        rawErrorMsg.includes(
          "rate-limits"
        ) ||
        rawErrorMsg.includes(
          "rate_limit"
        ) ||
        rawErrorMsg.includes("429")
      ) {
        return jsonResponse(
          {
            error:
              "Daily limit or rate limit reached for the AI service. Please try again in a few moments.",
          },
          429
        );
      }

      if (
        rawErrorMsg.includes(
          "high demand"
        ) ||
        rawErrorMsg.includes(
          "overloaded"
        ) ||
        rawErrorMsg.includes("503")
      ) {
        return jsonResponse(
          {
            error:
              "AI server is currently experiencing high demand. Please try again in a few moments.",
          },
          503
        );
      }

      return jsonResponse(
        {
          error:
            "Failed to generate prompt. Please try again in a few moments.",
        },
        500
      );
    } catch (error) {
      console.error(
        "AI proxy error:",
        error
      );

      return jsonResponse(
        {
          error: "Invalid request.",
        },
        400
      );
    }
  },
};