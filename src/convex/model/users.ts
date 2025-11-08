import { TABLE_SLUG_ACCOUNTS, TABLE_SLUG_SESSIONS } from "~/db/constants";
import { err, ok } from "~/server/dal";

import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getAccount({ ctx, userId }: { ctx: QueryCtx, userId: string; }) {
	const account = await ctx.db.query(TABLE_SLUG_ACCOUNTS)
		.withIndex("by_userId", (q) => q.eq("userId", userId))
		.first()
	if (!account) {
		throw err({ type: "no-account" }).error
	}
	return account
}

export async function getCurrentUser({ ctx, token }: { ctx: MutationCtx | QueryCtx, token: string }) {
	const session = await ctx.db.query(TABLE_SLUG_SESSIONS).withIndex("by_token", (q) => q.eq("token", token)).first()
	if (!session) {
		return err({ type: "no-session" })
	}
	const user = await ctx.db.get(session.userId)
	if (!user) {
		return err({ type: "no-user" })
	}
	return ok(user)
}
