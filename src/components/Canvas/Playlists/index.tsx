import { useValue } from "@legendapp/state/react"
import { useEffect } from "react"

import { $spotifyStore } from "~/stores/spotify"

import TVInstances from "./TVInstances"

export default function Playlists() {
	const playlists = useValue($spotifyStore.userPlaylists)
	useEffect(() => {
		console.log('playlists: ', playlists)
	}, [playlists])
	return (
		<group>
			<TVInstances />
		</group>
	)
}
