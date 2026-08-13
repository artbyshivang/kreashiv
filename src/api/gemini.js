const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
  "gemini-2.0-flash",
];

export async function generateGeminiPrompt(promptText) {
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

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

  throw lastError || new Error("Failed to generate prompt. Please try again in a few moments.");
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