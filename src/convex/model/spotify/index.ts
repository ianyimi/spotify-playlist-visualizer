import type { internal } from "~/convex/_generated/api";
import type { SpotifyPlaylistsResponse } from "~/lib/types";

import { err } from "~/server/dal";

import { spotifyFetch } from "./utils";

export async function fetchAllUserPlaylists({ accessToken, playlistsCount }: { accessToken: string, playlistsCount: number }) {
	const userPlaylists: typeof internal.spotify.insertPlaylists["_args"]["playlists"] = []
	const playlistsRes = await spotifyFetch<SpotifyPlaylistsResponse>({
		accessToken,
		endpoint: "me/playlists"
	})
	const total = playlistsRes.total
	if (total <= playlistsCount) {
		throw err({ message: "Query up to date" }).error
	}
	const limit = playlistsRes.limit
	for (const playlist of playlistsRes.items) {
		userPlaylists.push({
			id: playlist.id,
			name: playlist.name,
			collaborative: playlist.collaborative,
			images: playlist.images,
			public: playlist.public,
		})
	}
	if (total < limit) {
		return userPlaylists
	}
	let next = playlistsRes.next
	while (next !== null) {
		const nextPageRes = await spotifyFetch<SpotifyPlaylistsResponse>({
			accessToken,
			url: next
		})
		for (const playlist of nextPageRes.items) {
			userPlaylists.push({
				id: playlist.id,
				name: playlist.name,
				collaborative: playlist.collaborative,
				images: playlist.images,
				public: playlist.public,
			})
		}
		next = nextPageRes.next
	}
	return userPlaylists
}
