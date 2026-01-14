
import { GoogleGenAI, Type } from "@google/genai";
import { Riddle, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateLevelRiddles = async (levelNumber: number): Promise<Riddle[]> => {
  let difficulty = Difficulty.EASY;
  if (levelNumber > 50) difficulty = Difficulty.MEDIUM;
  if (levelNumber > 150) difficulty = Difficulty.HARD;

  const prompt = `أنت صانع ألغاز محترف. قم بإنشاء 10 ألغاز عربية للمرحلة رقم ${levelNumber}.
  المستوى المطلوب: ${difficulty === Difficulty.EASY ? 'سهل وبسيط' : difficulty === Difficulty.MEDIUM ? 'متوسط يحتاج تفكير' : 'صعب جداً وخادع'}.
  يجب أن تكون الألغاز متنوعة (لغوية، منطقية، ذكاء).
  كل لغز يجب أن يحتوي على السؤال، 4 اختيارات، ورقم الاختيار الصحيح (0-3).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const riddles = JSON.parse(response.text);
    return riddles;
  } catch (error) {
    console.error("Error generating riddles:", error);
    // Fallback static riddles in case of API failure
    return Array(10).fill(null).map((_, i) => ({
      id: `fallback-${levelNumber}-${i}`,
      question: `لغز رقم ${i + 1} للمرحلة ${levelNumber} (حدث خطأ في تحميل البيانات)`,
      options: ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      correctAnswer: 0,
      explanation: "هذا لغز مؤقت بسبب مشكلة في الاتصال."
    }));
  }
};
