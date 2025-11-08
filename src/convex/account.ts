import { v } from "convex/values";

import { TABLE_SLUG_ACCOUNTS } from "~/db/constants";

import { internalMutation } from "./_generated/server";

export const patchAccessToken = internalMutation({
	args: {
		id: v.id(TABLE_SLUG_ACCOUNTS),
		accessToken: v.string(),
		accessTokenExpiresAt: v.number()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			accessToken: args.accessToken,
			accessTokenExpiresAt: args.accessTokenExpiresAt,
		})
	}
})
