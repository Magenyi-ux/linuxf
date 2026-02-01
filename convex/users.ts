
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const storeUser = mutation({
  args: {
    name: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    deviceId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { tokenIdentifier, deviceId, name } = args;

    if (tokenIdentifier) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();
      if (existing) {
        if (name && existing.name !== name) {
          await ctx.db.patch(existing._id, { name });
        }
        return existing._id;
      }
      return await ctx.db.insert("users", { tokenIdentifier, name });
    } else if (deviceId) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_device", (q) => q.eq("deviceId", deviceId))
        .unique();
      if (existing) return existing._id;
      return await ctx.db.insert("users", { deviceId, name: "Guest" });
    }
  },
});

export const getUser = query({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.userId) return null;
        const byToken = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId!))
            .unique();
        if (byToken) return byToken;

        return await ctx.db
            .query("users")
            .withIndex("by_device", (q) => q.eq("deviceId", args.userId!))
            .unique();
    }
});
