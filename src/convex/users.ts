import { v } from "convex/values";

import { COLLECTION_SLUG_SESSIONS } from "~/db/constants";

import { query } from "./_generated/server";

export const getCurrentUser = query({
	args: {
		token: v.string()
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.query(COLLECTION_SLUG_SESSIONS).withIndex("by_token", (q) => q.eq("token", args.token)).first()
		if (!session) { return null }
		const user = await ctx.db.get(session.userId)
		if (!user) { return null }
		return user
	}
})
