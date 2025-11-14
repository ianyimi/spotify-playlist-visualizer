import { useValue } from "@legendapp/state/react"
import { useEffect } from "react"

import type { GroupProps } from "~/types"

import { $spotifyStore } from "~/stores/spotify"

import TVInstances from "./TVInstances"

export default function Playlists(props: GroupProps) {
	const playlists = useValue($spotifyStore.userPlaylists)
	useEffect(() => {
		console.log('playlists: ', playlists)
	}, [playlists])
	return (
		<group {...props}>
			<TVInstances />
		</group>
	)
}
