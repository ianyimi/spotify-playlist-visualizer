import type { internal } from "~/convex/_generated/api";
import type { SpotifyPlaylistsResponse } from "~/lib/types";

import { spotifyFetch } from "./utils";

export async function fetchAllUserPlaylists({ accessToken, accountId, userOwnedPlaylistsTotal, userPlaylistsTotal }: { accessToken: string, accountId: string; userOwnedPlaylistsTotal: number; userPlaylistsTotal: number, }) {
	const userPlaylists: typeof internal.spotify.insertPlaylists["_args"]["playlists"] = []
	const playlistsRes = await spotifyFetch<SpotifyPlaylistsResponse>({
		accessToken,
		endpoint: "me/playlists"
	})
	const userPlaylistsApiTotal = playlistsRes.total
	if (userOwnedPlaylistsTotal !== 0 && userPlaylistsApiTotal <= userPlaylistsTotal) {
		// console.warn("Playlist info up to date. [upt, uopt]: ", userPlaylistsTotal, userOwnedPlaylistsTotal)
		return { userPlaylists: [], userPlaylistsApiTotal }
	}
	const limit = playlistsRes.limit
	for (const playlist of playlistsRes.items) {
		if (playlist.owner.id === accountId) {
			userPlaylists.push({
				id: playlist.id,
				name: playlist.name,
				collaborative: playlist.collaborative,
				images: playlist.images,
				public: playlist.public,
			})
		}
	}
	if (userPlaylistsApiTotal < limit) {
		return { userPlaylists, userPlaylistsApiTotal }
	}
	let next = playlistsRes.next
	while (next !== null) {
		const nextPageRes = await spotifyFetch<SpotifyPlaylistsResponse>({
			accessToken,
			url: next
		})
		for (const playlist of nextPageRes.items) {
			if (playlist.owner.id === accountId) {
				userPlaylists.push({
					id: playlist.id,
					name: playlist.name,
					collaborative: playlist.collaborative,
					images: playlist.images,
					public: playlist.public,
				})
			}
		}
		next = nextPageRes.next
	}
	return { userPlaylists, userPlaylistsApiTotal }
}
