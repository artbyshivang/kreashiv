import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const genAI =
  new GoogleGenerativeAI(apiKey);

const model =
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

export default model;