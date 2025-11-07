import { v } from "convex/values";

import { COLLECTION_SLUG_USER_ROLES, COLLECTION_SLUG_USERS } from "~/db/constants";

import { query } from "./_generated/server";

export const getCurrentUserRoles = query({
	args: {
		id: v.id(COLLECTION_SLUG_USERS)
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null
		}

		// Now get the roles from YOUR app's userRoles table
		const userRoles = await ctx.db
			.query(COLLECTION_SLUG_USER_ROLES)
			.withIndex("by_userId", (q) => q.eq("userId", args.id))
			.first()

		if (!userRoles) {
			return null
		}

		return userRoles.roles
	}
})
