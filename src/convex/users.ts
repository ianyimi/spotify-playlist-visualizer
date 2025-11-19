import { v } from "convex/values";

import { TABLE_SLUG_PLAYLISTS, TABLE_SLUG_USERS } from "~/db/constants";

import { internalMutation, internalQuery, query } from "./_generated/server";
import { getAccount, getCurrentUser, patchUserPlaylists } from "./model/users"

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

export const getPlaylistsTotals = internalQuery({
	args: { id: v.id(TABLE_SLUG_USERS) },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.id)
		return { userOwnedPlaylistsTotal: user?.playlistIds.length ?? 0, userPlaylistsTotal: user?.playlistsApiTotal ?? 0 }
	}
})

export const patchPlaylists = internalMutation({
	args: { id: v.id(TABLE_SLUG_USERS), playlistIds: v.array(v.id(TABLE_SLUG_PLAYLISTS)), userOwnedPlaylistsTotal: v.number(), userPlaylistsTotal: v.number() },
	handler: async (ctx, args) => {
		await patchUserPlaylists({
			ctx,
			playlistIds: args.playlistIds,
			userId: args.id,
			userOwnedPlaylistsTotal: args.userOwnedPlaylistsTotal,
			userPlaylistsTotal: args.userPlaylistsTotal
		})
	}
})
