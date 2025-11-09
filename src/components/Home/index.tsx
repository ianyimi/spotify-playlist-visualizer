"use client"

import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";

import type { UserID } from "~/convex/types";

import { useSession } from "~/auth/client";
import Dom from "~/components/Dom";
import { api } from "~/convex/_generated/api";

export default function Home() {
	const { data: session, isPending } = useSession()
	const userId = session?.user?.id as undefined | UserID
	const userPlaylists = useQuery(api.spotify.readPlaylists, userId ? { userId } : "skip")

	const refreshPlaylistsMutation = useMutation(api.spotify.refreshPlaylists)

	useEffect(() => {
		async function refreshPlaylists() {
			if (!userId) { return }
			await refreshPlaylistsMutation({ id: userId })
		}
		void refreshPlaylists()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId])
	console.log('playlists: ', userPlaylists)

	return (
		<Dom>
			<main className="flex-1 flex min-h-[100svh] flex-col items-center justify-center text-white">
				<div className="container mx-auto px-4">
					<h1 className="text-4xl font-bold mb-8">Spotify Playlist Visualizer</h1>
					{isPending ? (
						<p>Loading session...</p>
					) : userId ? (
						<div>
							<p className="mb-4">User ID: {userId}</p>
							{userPlaylists ? (
								<div>
									<p className="mb-2">Playlists: {userPlaylists.length}</p>
								</div>
							) : (
								<p>Loading playlists...</p>
							)}
						</div>
					) : (
						<p>Please sign in to view your playlists</p>
					)}
				</div>
			</main>
		</Dom>
	);
}
