import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * テキストを指定されたプロンプトに基づいて翻訳/変換する
 */
export async function translateWithAI(prompt: string) {
  if (!apiKey) {
    // APIキーがない場合のフォールバック（開発用）
    return "（AI翻訳のデモ：APIキーが設定されていません）";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.8, // ランダム性を少し高めに
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("翻訳に失敗しました。時間をおいて再度お試しください。");
  }
}
