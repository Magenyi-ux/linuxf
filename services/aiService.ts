import OpenAI from "openai";
import { ExamType, Subject, Question } from "../types";
import { fallbackData } from "./fallbackData";

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY || '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',
    baseURL: "https://integrate.api.nvidia.com/v1",
    dangerouslyAllowBrowser: true // Required for frontend usage
});

/**
 * Sanitizes a raw string from the LLM to be valid JSON.
 */
const cleanAndParseJson = (text: string): any[] => {
    if (!text) return [];

    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const splitIndex = cleaned.indexOf('][');
    if (splitIndex !== -1) {
        cleaned = cleaned.substring(0, splitIndex + 1);
    }

    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
         return ' ';
    });

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1) {
            let candidate = cleaned.substring(firstBracket, lastBracket + 1);
            const innerSplit = candidate.indexOf('][');
            if (innerSplit !== -1) {
                candidate = candidate.substring(0, innerSplit + 1);
            }
            try {
                return JSON.parse(candidate);
            } catch (e2) {
                 return [];
            }
        }
        return [];
    }
};

export const fetchExamQuestions = async (
  examType: ExamType,
  subject: Subject,
  year: string,
  count: number = 10
): Promise<{ questions: Question[], sources: string[] }> => {
  if (fallbackData[examType]?.[subject]?.[year]) {
      return {
          questions: fallbackData[examType][subject][year],
          sources: ["Local Past Questions Bank"]
      };
  }

  const model = "qwen/qwen3.5-122b-a10b";

  const yearContext = year === 'Random'
    ? "randomly selected from various past years (2010-2023)"
    : `specifically from the year ${year}`;

  const prompt = `
    Act as an expert SS3 Teacher in Nigeria.

    TASK:
    Generate ${count} practice questions for ${examType} ${subject} ${yearContext}.
    Ensure questions are authentic to the exam style (JAMB, WAEC, NECO).

    OUTPUT FORMAT:
    - Return ONLY a SINGLE VALID JSON ARRAY.
    - DO NOT output any conversational text or markdown.

    JSON STRUCTURE:
    [
      {
        "text": "Question text here...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctOptionIndex": 0,
        "explanation": "Detailed explanation here..."
      }
    ]
  `;

  try {
    console.log("Calling NVIDIA NIM with parameters:", { model, baseURL: "https://integrate.api.nvidia.com/v1" });
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const rawText = response.choices[0]?.message?.content || "[]";
    let data: Omit<Question, 'id'>[] = cleanAndParseJson(rawText);

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No questions generated. Malformed AI response.");
    }

    const questions = data.map((q, index) => ({
        ...q,
        id: Date.now() + index
    }));

    return { questions, sources: ["AI Generated via NVIDIA NIM"] };

  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
};

export const createTutorChatSession = () => {
  const history: { role: "user" | "assistant" | "system", content: string }[] = [
    {
        role: "system",
        content: "You are 'Professor Qwen', a wise and encouraging tutor specializing in West African exams (WAEC, JAMB, NECO). Your goal is to help students understand difficult concepts, solve math problems, and prepare for their exams. Be concise, use local context where appropriate for Nigerian students, and always be supportive. If asked about things outside of education/exams, politely steer the conversation back to studying."
    }
  ];

  return {
    sendMessage: async (message: string) => {
      history.push({ role: "user", content: message });

      console.log("Calling NVIDIA NIM Chat with model: qwen/qwen3.5-122b-a10b");
      const response = await openai.chat.completions.create({
        model: "qwen/qwen3.5-122b-a10b",
        messages: history,
        temperature: 0.7,
      });

      const responseText = response.choices[0]?.message?.content || "";
      history.push({ role: "assistant", content: responseText });

      return {
        response: {
          text: () => responseText
        }
      };
    }
  };
};
