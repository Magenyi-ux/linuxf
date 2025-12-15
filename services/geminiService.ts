
import { GoogleGenAI } from "@google/genai";
import { ExamType, Subject, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sanitizes a raw string from the LLM to be valid JSON.
 * Fixes:
 * 1. Markdown code blocks (```json ... ```)
 * 2. Double arrays (e.g. [...][...]) which cause syntax errors
 * 3. Unescaped newlines/control characters inside strings
 */
const cleanAndParseJson = (text: string): any[] => {
    if (!text) return [];

    // 1. Remove Markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. Handle specific LLM artifact: Concatenated Arrays like [...][...]
    // If we find "][" this indicates the model outputted two arrays back-to-back.
    // We strictly want only the first one.
    const splitIndex = cleaned.indexOf('][');
    if (splitIndex !== -1) {
        console.warn("Detected double JSON array in response. Truncating to first array.");
        cleaned = cleaned.substring(0, splitIndex + 1);
    }

    // 3. Fix "Bad control character" errors
    // Replace ASCII control characters (0-31) which are illegal in JSON strings unless escaped.
    // We replace newlines (\n), tabs (\t), etc. with a single space to preserve flow but fix syntax.
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
         return ' ';
    });

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON parse failed. Attempting advanced repair.", e);
        
        // 4. Fallback: Extract the outermost array brackets
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1) {
            let candidate = cleaned.substring(firstBracket, lastBracket + 1);
            
            // Re-check for the double array pattern inside the candidate
            const innerSplit = candidate.indexOf('][');
            if (innerSplit !== -1) {
                candidate = candidate.substring(0, innerSplit + 1);
            }

            try {
                return JSON.parse(candidate);
            } catch (e2) {
                 console.error("Advanced repair failed.", e2);
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
  const model = "gemini-2.5-flash";

  const yearContext = year === 'Random' 
    ? "randomly selected from various past years (2010-2023)" 
    : `specifically from the year ${year}`;

  const prompt = `
    Act as an expert SS3 Teacher in Nigeria.
    
    TASK:
    Generate ${count} practice questions for ${examType} ${subject} ${yearContext}.
    
    SOURCE MATERIAL:
    - You MUST use Google Search to find questions.
    - **SEARCH QUERY**: "site:myschool.ng ${examType} ${subject} ${year} past questions"
    - **TARGET WEBSITE**: myschool.ng/classroom
    - Ensure questions are authentic to the exam style found on this site.

    OUTPUT FORMAT:
    - Return ONLY a SINGLE VALID JSON ARRAY.
    - **DO NOT** output the JSON array twice.
    - **DO NOT** output any conversational text or markdown.
    - **DO NOT** include literal line breaks inside the strings.
    
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
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        temperature: 0.3, 
      }
    });

    const rawText = response.text || "[]";
    
    // Use the robust parser
    let data: Omit<Question, 'id'>[] = cleanAndParseJson(rawText);

    if (!Array.isArray(data) || data.length === 0) {
        console.warn("Gemini returned empty or invalid data:", rawText.substring(0, 500) + "...");
        throw new Error("No questions generated. The AI response was malformed. Please try again.");
    }

    // Add unique IDs
    const questions = data.map((q, index) => ({ 
        ...q, 
        id: Date.now() + index 
    }));

    const sources: string[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web?.uri)
      .filter((uri: string) => uri) || [];
    
    const uniqueSources = Array.from(new Set(sources));

    return { questions, sources: uniqueSources };

  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
};

export const createTutorChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are 'Professor Gemini', a wise and encouraging tutor specializing in West African exams (WAEC, JAMB, NECO). Your goal is to help students understand difficult concepts, solve math problems, and prepare for their exams. Be concise, use local context where appropriate for Nigerian students, and always be supportive. If asked about things outside of education/exams, politely steer the conversation back to studying.",
    },
  });
};
