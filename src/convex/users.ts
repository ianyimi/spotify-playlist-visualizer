import { v } from "convex/values";

import { TABLE_SLUG_USERS } from "~/db/constants";

import { internalQuery, query } from "./_generated/server";
import { getAccount, getCurrentUser } from "./model/users"

export const getUser = query({
	args: {
		token: v.string()
	},
	handler: async (ctx, args) => {
		return await getCurrentUser({ ctx, token: args.token })
	}
})

export const getUserAccount = internalQuery({
	args: { id: v.id(TABLE_SLUG_USERS) },
	handler: async (ctx, args) => {
		return await getAccount({ ctx, userId: args.id })
	}
})
