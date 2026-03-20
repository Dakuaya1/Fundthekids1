import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateText(prompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_API_KEY is not set. Falling back to heuristic mode.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating text with Google Gemini API:", error);
    return null;
  }
}
