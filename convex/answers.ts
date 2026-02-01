
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveAnswer = mutation({
  args: {
    userId: v.string(),
    bookId: v.string(),
    questionId: v.number(),
    selectedOption: v.number(),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("answers", {
      userId: args.userId,
      bookId: args.bookId,
      questionId: args.questionId,
      selectedOption: args.selectedOption,
      isCorrect: args.isCorrect,
      timestamp: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    userId: v.string(),
    bookId: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", args.userId).eq("bookId", args.bookId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastScore: args.score,
        bestScore: Math.max(existing.bestScore, args.score),
        attempts: existing.attempts + 1,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId: args.userId,
        bookId: args.bookId,
        lastScore: args.score,
        bestScore: args.score,
        attempts: 1,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getUserProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProgress")
      .withIndex("by_user_book", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
