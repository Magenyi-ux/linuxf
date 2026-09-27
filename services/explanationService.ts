import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { ExamType, Question, Subject } from "../types";

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export async function attachSupabaseExplanations(
  questions: Question[],
  examType: ExamType,
  subject: Subject,
  year: string
): Promise<Question[]> {
  if (!isSupabaseConfigured || questions.length === 0 || !/^\d{4}$/.test(year)) {
    return questions;
  }

  const numericYear = Number(year);
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("question_text, explanation")
    .eq("subject", subject)
    .eq("exam_type", examType)
    .eq("exam_year", numericYear)
    .in("question_text", questions.map((question) => question.text));

  if (error) {
    console.warn("Supabase explanations unavailable; keeping ICN explanations:", error.message);
    return questions;
  }

  const explanationByQuestion = new Map(
    (data ?? [])
      .filter((row) => typeof row.explanation === "string" && row.explanation.trim().length >= 20)
      .map((row) => [normalize(row.question_text), row.explanation.trim()])
  );

  if (explanationByQuestion.size === 0) return questions;

  return questions.map((question) => {
    const explanation = explanationByQuestion.get(normalize(question.text));
    return explanation ? { ...question, explanation } : question;
  });
}
