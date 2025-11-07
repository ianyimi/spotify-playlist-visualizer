import { query } from "./_generated/server";


export const getCurrentUserRoles = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const userRoles = await ctx.db.query(COLLECTION_SLUG_USER_ROLES).withIndex("by_email", (q) => q.eq("email", identity.email!)).first();
	}
});

