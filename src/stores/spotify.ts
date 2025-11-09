import { observable } from "@legendapp/state";

import type { Playlist } from "~/convex/types";

export interface SpotifyStore {
	userPlaylists: Playlist[]
}

export const $spotifyStore = observable<SpotifyStore>({
	userPlaylists: [],
});
