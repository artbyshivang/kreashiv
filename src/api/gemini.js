const MODELS = [
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
];

export async function generateGeminiPrompt(promptText) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("Gemini API key missing. Please check your configuration.");
  }

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      console.warn(`Model ${modelName} status ${response.status}:`, data?.error?.message);
      lastError = new Error(data?.error?.message || `Failed with ${modelName}`);
    } catch (err) {
      console.warn(`Model ${modelName} fetch exception:`, err);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || "Failed to generate prompt. Please try again in a few moments.");
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