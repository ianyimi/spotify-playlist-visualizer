import { observable } from "@legendapp/state";

import type { Playlist } from "~/convex/types";

interface SpotifyStore {
	activePlaylists: Playlist[];
	loadingPlaylistTracks: boolean;
	loadingUserPlaylists: boolean;
	playlistsReady: boolean; // All playlists loaded and processed
	tracksReady: boolean; // All tracks for active playlist loaded
	userPlaylists: Playlist[];
}

export const $spotifyStore = observable<SpotifyStore>({
	activePlaylists: [],
	loadingPlaylistTracks: false,
	loadingUserPlaylists: false,
	playlistsReady: false,
	tracksReady: false,
	userPlaylists: [],
});

interface SpotifyStoreActions {
	clearActivePlaylists: () => void;
	clearState: () => void;
	popActivePlaylists: (playlist: number | Playlist) => Playlist | undefined;
	setLoadingPlaylists: (loading: boolean) => void;
	setLoadingTracks: (loading: boolean) => void;
	setPlaylistsReady: (ready: boolean) => void;
	setTracksReady: (ready: boolean) => void;
	unshiftActivePlaylists: (playlist: number | Playlist) => void;
}

export const $spotifyStoreActions = observable<SpotifyStoreActions>({
	clearActivePlaylists: () => {
		$spotifyStore.activePlaylists.set([]);
		$spotifyStore.tracksReady.set(false);
	},

	clearState: () => {
		$spotifyStore.set({
			activePlaylists: [],
			loadingPlaylistTracks: false,
			loadingUserPlaylists: false,
			playlistsReady: false,
			tracksReady: false,
			userPlaylists: []
		})
	},

	popActivePlaylists: () => {
		return $spotifyStore.activePlaylists.pop()
	},

	unshiftActivePlaylists: (playlist: number | Playlist) => {
		if (typeof playlist === "number") {
			const p = $spotifyStore.userPlaylists.at(playlist)
			if (!p) { return }
			$spotifyStore.activePlaylists.unshift(p)
			return
		}
		$spotifyStore.activePlaylists.unshift(playlist)
	},

	setLoadingPlaylists: (loading) => {
		$spotifyStore.loadingUserPlaylists.set(loading);
		if (!loading) {
			// When loading finishes, playlists are ready
			$spotifyStore.playlistsReady.set(true);
		}
	},

	setLoadingTracks: (loading) => {
		$spotifyStore.loadingPlaylistTracks.set(loading);
		if (!loading) {
			// When loading finishes, tracks are ready
			$spotifyStore.tracksReady.set(true);
		}
	},

	setPlaylistsReady: (ready) => $spotifyStore.playlistsReady.set(ready),

	setTracksReady: (ready) => $spotifyStore.tracksReady.set(ready),
})
