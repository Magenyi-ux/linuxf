
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()), // Clerk identity
    deviceId: v.optional(v.string()), // Fallback device identity
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_device", ["deviceId"]),

  books: defineTable({
    examType: v.string(),
    subject: v.string(),
    year: v.string(),
    questions: v.array(
      v.object({
        id: v.number(),
        text: v.string(),
        options: v.array(v.string()),
        correctOptionIndex: v.number(),
        explanation: v.string(),
      })
    ),
    sources: v.array(v.string()),
    dateCreated: v.number(),
    isPublic: v.boolean(),
    creatorId: v.optional(v.string()), // tokenIdentifier or deviceId
  }).index("by_exam_subject_year", ["examType", "subject", "year"]),

  userProgress: defineTable({
    userId: v.string(), // tokenIdentifier or deviceId
    bookId: v.string(), // e.g., "JAMB-Mathematics-2023"
    bestScore: v.number(),
    lastScore: v.number(),
    attempts: v.number(),
    updatedAt: v.number(),
  }).index("by_user_book", ["userId", "bookId"]),

  answers: defineTable({
    userId: v.string(),
    bookId: v.string(),
    questionId: v.number(),
    selectedOption: v.number(),
    isCorrect: v.boolean(),
    timestamp: v.number(),
  }).index("by_user_book", ["userId", "bookId"]),
});
