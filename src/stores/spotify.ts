import { observable } from "@legendapp/state";

import type { Playlist } from "~/convex/types";

interface SpotifyStore {
	activePlaylist: null | Playlist;
	loadingPlaylistTracks: boolean;
	loadingUserPlaylists: boolean;
	playlistsReady: boolean; // All playlists loaded and processed
	tracksReady: boolean; // All tracks for active playlist loaded
	userPlaylists: Playlist[];
}

export const $spotifyStore = observable<SpotifyStore>({
	activePlaylist: null,
	loadingPlaylistTracks: false,
	loadingUserPlaylists: false,
	playlistsReady: false,
	tracksReady: false,
	userPlaylists: [],
});

interface SpotifyStoreActions {
	clearActivePlaylist: () => void;
	setActivePlaylist: (playlist: number | Playlist) => void;
	setLoadingPlaylists: (loading: boolean) => void;
	setLoadingTracks: (loading: boolean) => void;
	setPlaylistsReady: (ready: boolean) => void;
	setTracksReady: (ready: boolean) => void;
}

export const $spotifyStoreActions = observable<SpotifyStoreActions>({
	setActivePlaylist: (playlist: number | Playlist) => {
		if (typeof playlist === "number") {
			$spotifyStore.activePlaylist.set($spotifyStore.userPlaylists.get()[playlist] ?? null)
			return
		}
		$spotifyStore.activePlaylist.set(playlist)
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

	clearActivePlaylist: () => {
		$spotifyStore.activePlaylist.set(null);
		$spotifyStore.tracksReady.set(false);
	}
})
