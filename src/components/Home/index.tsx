"use client"

import { useConvexMutation } from "@convex-dev/react-query";
import { useValue } from "@legendapp/state/react";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { useEffect } from "react";

import type { UserID } from "~/convex/types";

import { useSession } from "~/auth/client";
import SignInButton from "~/components/auth/SignIn";
import Dom from "~/components/Dom"
import { api } from "~/convex/_generated/api";
import { $spotifyStore, $spotifyStoreActions } from "~/stores/spotify";

export default function Home() {
	const { data: session, isPending } = useSession()
	const { setLoadingPlaylists } = useValue($spotifyStoreActions)
	const userId = session?.user?.id as undefined | UserID
	const userPlaylists = useQuery(api.spotify.readPlaylists, userId ? { userId } : "skip")

	const refreshPlaylistsMutation = useMutation({
		mutationFn: useConvexMutation(api.spotify.refreshPlaylists),
		onMutate: () => setLoadingPlaylists(true),
		onSettled: () => setLoadingPlaylists(true),
		onSuccess: () => setLoadingPlaylists(true),
	})

	useEffect(() => {
		async function refreshPlaylists() {
			if (!userId) { return }
			await refreshPlaylistsMutation.mutateAsync({ id: userId })
		}
		void refreshPlaylists()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId])

	useEffect(() => {
		if (!userPlaylists || userPlaylists.length < 1) { return }
		$spotifyStore.userPlaylists.set(userPlaylists)
	}, [userPlaylists])

	return (
		<Dom>
			<main className="flex-1 flex min-h-[100svh] relative flex-col items-center justify-center  text-white">
				<SignInButton className="absolute bottom-40" loading={isPending} />
			</main>
		</Dom>
	);
}
