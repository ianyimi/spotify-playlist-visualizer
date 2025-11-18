"use client"

import type { ComponentPropsWithRef } from "react"

import { useValue } from "@legendapp/state/react"
import { Loader2Icon, LogIn, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { signIn, signOut, useSession } from "~/auth/client"
import { $sceneStore, $sceneStoreActions } from "~/stores/scene"
import { $spotifyStoreActions } from "~/stores/spotify"
import { cn } from "~/styles/utils"
import { Button } from '~/ui/button'

export default function SignInButton({ className, loading, ...buttonProps }: ComponentPropsWithRef<"button"> & { loading: boolean }) {
	const { data: session } = useSession()
	const sceneStoreActions = useValue($sceneStoreActions)
	const spotifyStoreActions = useValue($spotifyStoreActions)
	const router = useRouter()

	if (loading) {
		return (
			<Button className="justify-between cursor-pointer gap-2" variant="default">
				<Loader2Icon className="animate-spin" />
				<span>Loading</span>
			</Button>
		)
	}

	async function handleAuth() {
		if (!session) {
			await signIn.social({ provider: "spotify" })
		} else {
			await signOut({
				fetchOptions: {
					onSuccess: async () => {
						let trigger = false
						await sceneStoreActions.animatePlaylistsMaterialBlend({
							// config: {
							// 	duration: 1000
							// },
							to: 0,
							// @ts-expect-error react spring mismatched onChange type
							onChange: (result: number) => {
								$sceneStore.playlists.materialBlendValue.set(result)
								if (!trigger && result <= 0.75) {
									sceneStoreActions.setPlaylistsSceneStatus("closing")
									void sceneStoreActions.animatePlaylistsSceneBlend({
										config: {
											duration: 1000
										},
										to: 0
									})
									trigger = true
								}
							}
						})
						router.push("/")
						router.refresh()
						spotifyStoreActions.clearState()
					}
				}
			})
		}
	}

	return (
		<Button className={cn("justify-between cursor-pointer gap-2", className)} onClick={handleAuth} variant="default" {...buttonProps}>
			{!session ? (
				<LogOut size={20} />
			) : (
				<LogIn size={20} />
			)
			}
			<span>{session ? 'Sign Out' : 'Sign In'}</span>
		</Button>
	)
}


