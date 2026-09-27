import OpenAI from "openai";
import { ExamType, Subject, Question } from "../types";
import { getQuestionsFromIcnApi } from "./icnQuestionApi";
import { attachSupabaseExplanations } from "./explanationService";

const openai = new OpenAI({
    apiKey: 'pk-this-is-a-placeholder-the-proxy-handles-auth',
    baseURL: typeof window !== 'undefined' ? `${window.location.origin}/api/nvidia/v1` : "/api/nvidia/v1",
    dangerouslyAllowBrowser: true // Required for frontend usage
});

// Authentication is supplied by the server-side NVIDIA proxy through NV_API_KEY.
const PROFESSOR_API_KEY = 'pk-this-is-a-placeholder-the-proxy-handles-auth';
const PROFESSOR_MODELS = [
    "deepseek-ai/deepseek-v3.2",
    "minimax/minimax-m2.1",
    "thudm/glm-4.7",
    "moonshotai/kimi-k2.5",
    "mistralai/devstral-2",
    "stepfun/step-3.5-flash",
];

const professorOpenAI = new OpenAI({
    apiKey: PROFESSOR_API_KEY,
    baseURL: typeof window !== 'undefined' ? `${window.location.origin}/api/nvidia/v1` : "/api/nvidia/v1",
    dangerouslyAllowBrowser: true
});

/**
 * Sanitizes a raw string from the LLM to be valid JSON.
 */
const cleanAndParseJson = (text: string): any[] => {
    if (!text) return [];

    let cleaned = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

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

const isCompleteQuestion = (question: Partial<Question>): question is Omit<Question, "id"> => (
  typeof question.text === "string" && question.text.trim().length > 0 &&
  Array.isArray(question.options) && question.options.length === 4 &&
  question.options.every((option) => typeof option === "string" && option.trim().length > 0) &&
  typeof question.correctOptionIndex === "number" && question.correctOptionIndex >= 0 && question.correctOptionIndex <= 3 &&
  typeof question.explanation === "string" && question.explanation.trim().length >= 20
);

export const fetchExamQuestions = async (
  examType: ExamType,
  subject: Subject,
  year: string,
  count: number = 10
): Promise<{ questions: Question[], sources: string[] }> => {
  // 1. Try the GitHub-hosted question bank. The loader caches successful downloads for offline use.
  const localQuestions = await getQuestionsFromIcnApi(examType, subject, year, count);
  if (localQuestions && localQuestions.questions.length > 0) {
      const questionsWithSupabaseExplanations = await attachSupabaseExplanations(
          localQuestions.questions,
          examType,
          subject,
          year
      );
      return { ...localQuestions, questions: questionsWithSupabaseExplanations };
  }

  // If no local pack is available, use the configured server-side AI proxy.
  // The published question banks remain the primary source of exam content.
  // Fallback to AI Generation
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

    const questions = data
      .filter((question): question is Omit<Question, "id"> => isCompleteQuestion(question))
      .map((question, index) => ({
        ...question,
        id: Date.now() + index
      }));

    if (questions.length === 0) {
      throw new Error("The generated question set did not contain four complete options and a detailed explanation for any item.");
    }

    return { questions, sources: ["AI Generated via NVIDIA NIM"] };

  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
};

export const createTutorChatSession = (initialContext?: string) => {
  const history: { role: "user" | "assistant" | "system", content: any }[] = [
    {
      role: "system",
      content: `You are 'Professor', a wise and encouraging tutor specializing in West African exams (WAEC, JAMB, NECO).
      Your goal is to help students understand difficult concepts, solve math problems, and prepare for their exams.
      Be concise, use local context where appropriate for Nigerian students, and always be supportive.
      When explaining topics, use a simplified method and clear step-by-step reasoning.`
    }
  ];

  if (initialContext) {
    history.push({ role: "user", content: `CONTEXT FOR RESEARCH: ${initialContext}` });
    history.push({
      role: "assistant",
      content: "I've analyzed the question and explanation. I'm ready to help you master this topic."
    });
  }

  return {
    sendMessage: async (message: string, imageBase64?: string) => {
      // Professor is browser-bridged to the student's own Gemini session.
      // No Gemini API key or SphereLearn AI inference is used here.
      const promptParts = [
        "You are helping a Nigerian student prepare for WAEC, JAMB, or NECO.",
        "Act as Professor: explain clearly, use simple step-by-step reasoning, and focus on teaching rather than just giving an answer.",
      ];

      if (initialContext) {
        promptParts.push(`Question/context from Examply: ${initialContext}`);
      }

      const previousMessages = history
        .filter((item) => item.role === "user" || item.role === "assistant")
        .slice(-8)
        .map((item) => `${item.role === "user" ? "Student" : "Professor"}: ${typeof item.content === "string" ? item.content : ""}`)
        .filter(Boolean);

      if (previousMessages.length > 0) {
        promptParts.push("Relevant conversation context:", previousMessages.join("\\n"));
      }

      promptParts.push(`Student's new question: ${message}`);

      if (imageBase64) {
        promptParts.push(
          "The student also attached an image in Examply. Ask the student to attach the same image in Gemini because the browser bridge cannot transfer the image automatically."
        );
      }

      const geminiPrompt = promptParts.join("\\n\\n");

      // Open Gemini immediately so mobile browsers are less likely to block the new tab/window.
      if (typeof window !== "undefined") {
        window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
      }

      let copied = false;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(geminiPrompt);
          copied = true;
        } catch (error) {
          console.warn("Could not copy the Professor prompt to the clipboard:", error);
        }
      }

      history.push({ role: "user", content: message });

      const responseText = copied
        ? "Gemini has been opened in your browser. Your Professor prompt was copied to the clipboard—paste it into Gemini to continue."
        : "Gemini has been opened in your browser. Copy your question into Gemini to continue.";

      history.push({ role: "assistant", content: responseText });

      return {
        response: {
          text: () => responseText
        }
      };
    }
  };
};
