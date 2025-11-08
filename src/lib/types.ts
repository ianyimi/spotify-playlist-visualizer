// Define Spotify API response types
export type SpotifyPlaylistsResponse = {
	items: Array<{
		collaborative: boolean;
		description: null | string;
		id: string;
		images: Array<{ height: number; url: string; width: number }>;
		name: string;
		owner: {
			display_name: string;
			id: string;
		};
		public: boolean;
		tracks: {
			total: number;
		};
	}>;
	limit: number;
	next: null | string;
	offset: number;
	previous: null | string;
	total: number;
};
