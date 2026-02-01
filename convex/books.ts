
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPublicBooks = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("books")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
  },
});

export const getBook = query({
  args: { examType: v.string(), subject: v.string(), year: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_exam_subject_year", (q) =>
        q.eq("examType", args.examType)
          .eq("subject", args.subject)
          .eq("year", args.year)
      )
      .unique();
  },
});

export const saveBook = mutation({
  args: {
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
    isPublic: v.boolean(),
    creatorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("books")
      .withIndex("by_exam_subject_year", (q) =>
        q.eq("examType", args.examType)
          .eq("subject", args.subject)
          .eq("year", args.year)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("books", {
      examType: args.examType,
      subject: args.subject,
      year: args.year,
      questions: args.questions,
      sources: args.sources,
      isPublic: args.isPublic,
      creatorId: args.creatorId,
      dateCreated: Date.now(),
    });
  },
});
