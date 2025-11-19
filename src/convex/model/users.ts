import { TABLE_SLUG_ACCOUNTS, type TABLE_SLUG_PLAYLISTS, TABLE_SLUG_SESSIONS, type TABLE_SLUG_USERS } from "~/db/constants";
import { DAL_ERRORS, err, ok } from "~/server/dal";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getAccount({ ctx, userId }: { ctx: QueryCtx, userId: string; }) {
	const account = await ctx.db.query(TABLE_SLUG_ACCOUNTS)
		.withIndex("by_userId", (q) => q.eq("userId", userId))
		.first()
	if (!account) {
		throw new Error(DAL_ERRORS.noAccount.message)
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

export async function patchUserPlaylists({ ctx, playlistIds, userId, userOwnedPlaylistsTotal, userPlaylistsTotal }: { ctx: MutationCtx, playlistIds: Id<typeof TABLE_SLUG_PLAYLISTS>[]; userId: Id<typeof TABLE_SLUG_USERS>, userOwnedPlaylistsTotal: number; userPlaylistsTotal: number; }) {
	const user = await ctx.db.get<typeof TABLE_SLUG_USERS>(userId)
	if (userPlaylistsTotal !== user?.playlistsApiTotal) {
		await ctx.db.patch(userId, { playlistsApiTotal: userPlaylistsTotal })
	}
	if (playlistIds.length > userOwnedPlaylistsTotal) {
		console.log('patching playlist ids: ', playlistIds.length)
		await ctx.db.patch(userId, { playlistIds })
	}
}
