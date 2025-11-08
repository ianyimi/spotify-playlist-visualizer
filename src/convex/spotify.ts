import { v } from "convex/values";

import { TABLE_SLUG_PLAYLISTS, TABLE_SLUG_USERS } from "~/db/constants";

import type { Doc } from "./_generated/dataModel";

import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { fetchAllUserPlaylists } from "./model/spotify";
import { getAccessToken } from "./model/spotify/utils";

export const refreshPlaylists = mutation({
	args: { id: v.id(TABLE_SLUG_USERS) },
	handler: async (ctx, args) => {
		await ctx.scheduler.runAfter(0, internal.spotify.getUserPlaylists, {
			id: args.id
		})
	}
})

export const insertPlaylists = internalMutation({
	args: {
		playlists: v.array(v.object({
			id: v.string(),
			name: v.string(),
			collaborative: v.boolean(),
			images: v.union(
				v.null(),
				v.array(v.object({
					width: v.union(v.null(), v.number()),
					height: v.union(v.number(), v.null()),
					url: v.string()
				}))
			),
			public: v.boolean()
		})),
		userId: v.id(TABLE_SLUG_USERS)
	},
	handler: async (ctx, args) => {
		for (const playlist of args.playlists) {
			await ctx.db.insert(TABLE_SLUG_PLAYLISTS, {
				name: playlist.name,
				type: playlist.collaborative ? "collaborative" : playlist.public ? "public" : "private",
				images: playlist.images,
				playlistId: playlist.id,
				tracksId: [],
				userId: args.userId
			})
		}
	}
})

export const countPlaylists = internalQuery({
	args: {
		userId: v.id(TABLE_SLUG_USERS)
	},
	handler: async (ctx, args) => {
		let userPlaylistCount = 0
		const playlistsRes = await ctx.db.query(TABLE_SLUG_PLAYLISTS)
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.paginate({ cursor: null, numItems: 150 })
		userPlaylistCount += playlistsRes.page.length

		let cursor = playlistsRes.continueCursor
		let isDone = playlistsRes.isDone
		while (!isDone) {
			const nextPageRes = await ctx.db.query(TABLE_SLUG_PLAYLISTS)
				.withIndex("by_userId", (q) => q.eq("userId", args.userId))
				.paginate({ cursor, numItems: 150 })
			userPlaylistCount += nextPageRes.page.length
			isDone = nextPageRes.isDone;
			cursor = nextPageRes.continueCursor;
		}

		return userPlaylistCount
	}
})

export const readPlaylists = query({
	args: {
		userId: v.id(TABLE_SLUG_USERS)
	},
	handler: async (ctx, args) => {
		let userPlaylists: Doc<typeof TABLE_SLUG_PLAYLISTS>[] = []
		const playlistsRes = await ctx.db.query(TABLE_SLUG_PLAYLISTS)
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.paginate({ cursor: null, numItems: 150 })
		userPlaylists = userPlaylists.concat(playlistsRes.page)

		let cursor = playlistsRes.continueCursor
		let isDone = playlistsRes.isDone
		while (!isDone) {
			const nextPageRes = await ctx.db.query(TABLE_SLUG_PLAYLISTS)
				.withIndex("by_userId", (q) => q.eq("userId", args.userId))
				.paginate({ cursor, numItems: 150 })
			userPlaylists = userPlaylists.concat(nextPageRes.page)
			isDone = nextPageRes.isDone;
			cursor = nextPageRes.continueCursor;
		}

		return userPlaylists
	}
})

export const getUserPlaylists = internalAction({
	args: { id: v.id(TABLE_SLUG_USERS) },
	handler: async (ctx, args) => {
		const accessToken = await getAccessToken({
			ctx,
			userId: args.id,
		})
		const playlistsCount = await ctx.runQuery(internal.spotify.countPlaylists, {
			userId: args.id
		})
		const playlists = await fetchAllUserPlaylists({
			accessToken,
			playlistsCount
		})
		await ctx.runMutation(internal.spotify.insertPlaylists, {
			playlists,
			userId: args.id
		})
	}
})

