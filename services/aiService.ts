import OpenAI from "openai";
import { ExamType, Subject, Question } from "../types";
import { fallbackData } from "./fallbackData";

const openai = new OpenAI({
    // Sentinel: Using environment variable to prevent secret leakage.
    // Ensure VITE_NVIDIA_API_KEY is set in your environment or .env file.
    apiKey: import.meta.env.VITE_NVIDIA_API_KEY || "",
    baseURL: typeof window !== 'undefined' ? `${window.location.origin}/api/nvidia/v1` : "/api/nvidia/v1",
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

  const model = "meta/llama3-8b-instruct";

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
    const baseURL = typeof window !== 'undefined' ? `${window.location.origin}/api/nvidia/v1` : "/api/nvidia/v1";
    console.log("Calling NVIDIA NIM (proxied) with parameters:", { model, baseURL });
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

export const createTutorChatSession = (initialContext?: string) => {
  const model = "nvidia/neva-22b";
  const history: { role: "user" | "assistant" | "system", content: any }[] = [
    {
        role: "system",
        content: `You are 'Professor', a wise and encouraging tutor specializing in West African exams (WAEC, JAMB, NECO).
        Your goal is to help students understand difficult concepts, solve math problems, and prepare for their exams.
        Be concise, use local context where appropriate for Nigerian students, and always be supportive.
        When explaining topics, perform deep research, use 'Simplified Method' logic, and provide Markdown images from Wikipedia or Unsplash to aid understanding.
        Example image: ![Topic Image](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400)
        You have vision capabilities and can understand images provided via OCR or visual analysis.`
    }
  ];

  if (initialContext) {
    history.push({ role: "user", content: `CONTEXT FOR RESEARCH: ${initialContext}` });
    history.push({ role: "assistant", content: "I've analyzed the question and explanation. I'm ready to 'Dive Deep' and help you master this topic. What would you like to explore first? I can provide diagrams, prove concepts, or explain specific steps." });
  }

  return {
    sendMessage: async (message: string, imageBase64?: string) => {
      let content: any = message;

      if (imageBase64) {
        content = [
          { type: "text", text: message },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ];
      }

      history.push({ role: "user", content });

      console.log(`Calling NVIDIA NIM Chat with model: ${model}`);
      const response = await openai.chat.completions.create({
        model: model,
        messages: history as any,
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
