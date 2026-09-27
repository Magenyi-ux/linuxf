import { ExamType, Subject, Question } from "../types";
import { getQuestionsFromIcnApi } from "./icnQuestionApi";
import { attachSupabaseExplanations } from "./explanationService";

export const fetchExamQuestions = async (
  examType: ExamType,
  subject: Subject,
  year: string,
  count: number = 10
): Promise<{ questions: Question[], sources: string[] }> => {
  const localQuestions = await getQuestionsFromIcnApi(examType, subject, year, count);

  if (localQuestions && localQuestions.questions.length > 0) {
    const questionsWithSupabaseExplanations = await attachSupabaseExplanations(
      localQuestions.questions,
      examType,
      subject,
      year
    );

    return {
      ...localQuestions,
      questions: questionsWithSupabaseExplanations
    };
  }

  throw new Error("No questions are available for this exam, subject, and year.");
};
