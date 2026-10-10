import { getToken } from "@react-native-firebase/app-check";
import { getAppCheckInstance } from "../firebase/appCheck";
import auth from "../firebase/auth";

const PROXY_URL =
  "https://proxy-gemini.proxy-gemini.workers.dev/api/ai";

export async function generateGeminiPrompt(promptText) {
  if (!promptText || typeof promptText !== "string") {
    throw new Error("Prompt is required.");
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in to use AI.");
  }

  try {
    // Firebase Authentication ID token
    const idToken = await user.getIdToken();

    // Firebase App Check token (optional — proceed even if it fails)
    let appCheckToken = null;

    try {
      const appCheckInstance = getAppCheckInstance();

      if (appCheckInstance) {
        const appCheckTokenResult = await getToken(appCheckInstance, false);
        appCheckToken = appCheckTokenResult?.token || null;
      }
    } catch (appCheckError) {
      // App Check failure is non-fatal for preview/debug builds
      console.warn("App Check token skipped:", appCheckError?.message || appCheckError);
    }

    // Headers — App Check header sirf tab add karo jab token ho
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
    };

    // Send request to Cloudflare Gemini Proxy
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt: promptText,
      }),
    });

    const data = await response.json();

    if (response.ok && data?.text) {
      return data.text;
    }

    throw new Error(
      data?.error ||
        "Failed to generate prompt. Please try again in a few moments."
    );
  } catch (error) {
    console.error("Gemini proxy error:", error);

    // App Check errors ko user ko mat dikhao — generic message do
    const isAppCheckError =
      error?.code?.includes("appCheck") ||
      error?.message?.includes("appCheck") ||
      error?.message?.includes("App attestation") ||
      error?.message?.includes("token-error");

    throw new Error(
      isAppCheckError
        ? "Failed to generate prompt. Please try again in a few moments."
        : error?.message || "Failed to generate prompt. Please try again in a few moments."
    );
  }
}

const modelWrapper = {
  generateContent: async (aiPrompt) => {
    const textResult = await generateGeminiPrompt(aiPrompt);

    return {
      response: {
        text: () => textResult,
      },
    };
  },
};

export default modelWrapper;