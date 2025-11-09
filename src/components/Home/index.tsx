"use client"

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect } from "react";

import type { UserID } from "~/convex/types";

import { useSession } from "~/auth/client";
import SignInButton from "~/components/auth/SignIn";
import Dom from "~/components/Dom"
import { api } from "~/convex/_generated/api";
import { $spotifyStore } from "~/stores/spotify";

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

	useEffect(() => {
		if (!userPlaylists || userPlaylists.length < 1) { return }
		console.log('playlists: ', userPlaylists)
		$spotifyStore.userPlaylists.set(userPlaylists)
	}, [userPlaylists])

	return (
		<Dom>
			<main className="flex-1 flex min-h-[100svh] flex-col items-center justify-center  text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
						Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
					</h1>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="https://create.t3.gg/en/usage/first-steps"
							target="_blank"
						>
							<h3 className="text-2xl font-bold">First Steps →</h3>
							<div className="text-lg">
								Just the basics - Everything you need to know to set up your
								database and authentication.
							</div>
						</Link>
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="https://create.t3.gg/en/introduction"
							target="_blank"
						>
							<h3 className="text-2xl font-bold">Documentation →</h3>
							<div className="text-lg">
								Learn more about Create T3 App, the libraries it uses, and how
								to deploy it.
							</div>
						</Link>
					</div>
					<SignInButton loading={isPending} />
				</div>
			</main>
		</Dom>
	);
}
