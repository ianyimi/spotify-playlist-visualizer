import { observable } from "@legendapp/state";
import { type SpringUpdate, SpringValue } from "@react-spring/web";

import type { Playlist } from "~/convex/types";

interface SpotifyStore {
	activePlaylists: Playlist[];
	hoveredPlaylist: null | number;
	hoveredPlaylistsUniform: SpringValue<number>
	loadingPlaylistTracks: boolean;
	loadingUserPlaylists: boolean;
	playlistsReady: boolean; // All playlists loaded and processed
	prevHoveredPlaylist: null | number;
	prevHoveredPlaylistsUniform: SpringValue<number>
	tracksReady: boolean; // All tracks for active playlist loaded
	userPlaylists: Playlist[];
}

export const $spotifyStore = observable<SpotifyStore>({
	activePlaylists: [],
	hoveredPlaylist: null,
	hoveredPlaylistsUniform: new SpringValue(0),
	loadingPlaylistTracks: false,
	loadingUserPlaylists: false,
	playlistsReady: false,
	prevHoveredPlaylist: null,
	prevHoveredPlaylistsUniform: new SpringValue(0),
	tracksReady: false,
	userPlaylists: [],
});

interface SpotifyStoreActions {
	animateHoveredPlaylistsUniform: (props?: Omit<SpringUpdate<number>, "to">, prevProps?: Omit<SpringUpdate<number>, "to">) => Promise<void>;
	clearActivePlaylists: () => void;
	clearState: () => void;
	getHoveredPlaylistsUniformValue: () => number;
	getPrevHoveredPlaylistsUniformValue: () => number;
	popActivePlaylists: (playlist: number | Playlist) => Playlist | undefined;
	setHoveredPlaylist: (index: null | number) => void;
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
			hoveredPlaylist: null,
			hoveredPlaylistsUniform: new SpringValue(0),
			loadingPlaylistTracks: false,
			loadingUserPlaylists: false,
			playlistsReady: false,
			prevHoveredPlaylist: null,
			prevHoveredPlaylistsUniform: new SpringValue(0),
			tracksReady: false,
			userPlaylists: []
		})
	},

	animateHoveredPlaylistsUniform: async (props, prevProps) => {
		const hoveredPlaylist = $spotifyStore.hoveredPlaylist.get();
		const prevHoveredPlaylist = $spotifyStore.prevHoveredPlaylist.get();
		await Promise.all([
			hoveredPlaylist !== null ?
				$spotifyStore.hoveredPlaylistsUniform.get().start({
					from: 0,
					to: 1,
					...props
				})
				: Promise.resolve(),
			prevHoveredPlaylist !== null ?
				$spotifyStore.prevHoveredPlaylistsUniform.get().start({
					from: 1,
					to: 0,
					...prevProps
				})
				: Promise.resolve(),
		])
		// if (hoveredPlaylist) {
		// 	console.log(`animating hovered playlists uniform at index ${hoveredPlaylist}...`)
		// 	await $spotifyStore.hoveredPlaylistsUniform.get().start({
		// 		from: 0,
		// 		to: 1,
		// 		...props
		// 	})
		// }
		// if (prevHoveredPlaylist) {
		// 	console.log(`animating prev hovered playlists uniform at index ${prevHoveredPlaylist}...`)
		// 	await $spotifyStore.prevHoveredPlaylistsUniform.get().start({
		// 		from: 1,
		// 		to: 0,
		// 		...prevProps
		// 	})
		// }
	},

	getHoveredPlaylistsUniformValue: () => {
		return $spotifyStore.hoveredPlaylistsUniform.get().get()
	},
	getPrevHoveredPlaylistsUniformValue: () => {
		return $spotifyStore.prevHoveredPlaylistsUniform.get().get()
	},

	popActivePlaylists: () => {
		return $spotifyStore.activePlaylists.pop()
	},

	setHoveredPlaylist: (index) => {
		$spotifyStore.prevHoveredPlaylist.set($spotifyStore.hoveredPlaylist.get())
		$spotifyStore.hoveredPlaylist.set(index)
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
