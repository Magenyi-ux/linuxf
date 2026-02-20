
/**
 * geminiService.ts - Interface for Google Gemini AI
 * This service handles communication with the Gemini AI models for generating
 * exam questions and providing tutor chat sessions.
 */
import { GoogleGenAI } from "@google/genai";
import { ExamType, Subject, Question } from "../types";
import { fallbackQuestions } from "./fallbackData";

// Initialize the Gemini AI with the API key from environment variables
// Falls back to a placeholder if the key is missing
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "AIza_placeholder" });

/**
 * Sanitizes a raw string from the AI to ensure it's valid JSON.
 * AI models sometimes include extra text or formatting that can break JSON.parse().
 */
const cleanAndParseJson = (text: string): any[] => {
    if (!text) return [];

    // 1. Remove Markdown code blocks (e.g., ```json ... ```)
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. Handle cases where the AI might output multiple JSON arrays back-to-back
    const splitIndex = cleaned.indexOf('][');
    if (splitIndex !== -1) {
        console.warn("Detected double JSON array in response. Truncating to first array.");
        cleaned = cleaned.substring(0, splitIndex + 1);
    }

    // 3. Fix "Bad control character" errors by replacing illegal characters with spaces
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
         return ' ';
    });

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON parse failed. Attempting advanced repair.", e);
        
        // 4. Fallback: Extract the outermost array brackets if the parsing failed
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

/**
 * Fetches practice questions for a specific exam, subject, and year.
 */
export const fetchExamQuestions = async (
  examType: ExamType,
  subject: Subject,
  year: string,
  count: number = 10
): Promise<{ questions: Question[], sources: string[] }> => {
  // Use the flash model for faster response times in question generation
  const model = "gemini-1.5-flash";

  const yearContext = year === 'Random' 
    ? "randomly selected from various past years (2010-2023)" 
    : `specifically from the year ${year}`;

  // Construct the prompt to guide the AI
  const prompt = `
    Act as an expert SS3 Teacher in Nigeria.
    
    TASK:
    Generate ${count} practice questions for ${examType} ${subject} ${yearContext}.
    
    SOURCE MATERIAL:
    - You MUST use Google Search to find questions.
    - **SEARCH QUERY**: "(site:myschool.ng OR site:classhall.com OR site:pass.ng OR site:learn.myschool.ng) ${examType} ${subject} ${year} past questions"
    - **TARGET WEBSITES**: myschool.ng, classhall.com, pass.ng
    - Ensure questions are authentic to the exam style found on these sites.

    OUTPUT FORMAT:
    - Return ONLY a SINGLE VALID JSON ARRAY.
    - **DO NOT** output any conversational text or markdown.
    
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
    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Google Search for grounding
        temperature: 0.3, // Lower temperature for more consistent/factual output
      }
    });

    const rawText = response.text || "[]";
    
    // Parse the AI's response into a JS object
    let data: Omit<Question, 'id'>[] = cleanAndParseJson(rawText);

    if (!Array.isArray(data) || data.length === 0) {
        console.warn("Gemini returned empty or invalid data:", rawText.substring(0, 500) + "...");
        throw new Error("No questions generated. The AI response was malformed. Please try again.");
    }

    // Assign unique IDs to each question
    const questions = data.map((q, index) => ({ 
        ...q, 
        id: Date.now() + index 
    }));

    // Extract source URLs from the AI's grounding metadata
    const sources: string[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web?.uri)
      .filter((uri: string) => uri) || [];
    
    const uniqueSources = Array.from(new Set(sources));

    return { questions, sources: uniqueSources };

  } catch (error) {
    console.warn("AI failed to fetch questions, using fallback data:", error);

    // Filter fallback questions by subject and examType
    let filtered = fallbackQuestions.filter(q =>
        q.subject === subject && q.examType === examType
    );

    // Further filter by year if specified and not 'Random'
    if (year && year !== 'Random') {
        const yearFiltered = filtered.filter(q => q.year === year);
        if (yearFiltered.length > 0) {
            filtered = yearFiltered;
        }
        // If no questions for that year, we still use the filtered subject/exam set
    }

    // Shuffle and pick 'count' questions
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    if (selected.length === 0) {
        console.error(`No fallback questions available for ${subject} ${examType}`);
        throw error; // Re-throw the original AI error if even fallback fails
    }

    return {
        questions: selected.map(q => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation
        })),
        sources: ["https://myschool.ng/classroom/ (Offline Fallback)"]
    };
  }
};

/**
 * Creates a new chat session for the AI Tutor.
 */
export const createTutorChatSession = () => {
  return ai.chats.create({
    // Use the pro model for complex reasoning and tutoring
    model: 'gemini-1.5-pro',
    config: {
      tools: [{ googleSearch: {} }],
      // System instructions define the AI's personality and goals
      systemInstruction: "You are 'Professor Gemini', a wise and encouraging tutor specializing in West African exams (WAEC, JAMB, NECO). Your goal is to help students understand difficult concepts, solve math problems, and prepare for their exams. Be concise, use local context where appropriate for Nigerian students, and always be supportive. If asked about things outside of education/exams, politely steer the conversation back to studying. You can use Google Search to find current information or check specific past question details if asked.",
    },
  });
};
