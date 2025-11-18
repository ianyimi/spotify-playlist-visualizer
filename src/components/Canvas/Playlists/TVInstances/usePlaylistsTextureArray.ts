import { useValue } from "@legendapp/state/react"
import { useEffect, useState } from "react"
import { DataArrayTexture, LinearFilter, RGBAFormat } from "three"

import type { Playlist } from "~/convex/types"

import { $sceneStore, $sceneStoreActions } from "~/stores/scene"

export function usePlaylistsTextureArray(playlists: Playlist[]) {
	const [texture, setTexture] = useState<DataArrayTexture | null>(null)
	const sceneStoreActions = useValue($sceneStoreActions)

	useEffect(() => {
		if (!playlists || playlists.length === 0) { return }

		const size = 512
		const depth = playlists.length

		const data = new Uint8Array(size * size * depth * 4)
		const newTexture = new DataArrayTexture(data, size, size, depth)
		newTexture.format = RGBAFormat
		newTexture.minFilter = LinearFilter
		newTexture.magFilter = LinearFilter

		setTexture(newTexture)

		// Load playlist images
		let loadedCount = 0

		playlists.forEach((playlist, i) => {
			const imageUrl = playlist.images?.[1]?.url ?? playlist.images?.[0]?.url
			if (!imageUrl) {
				// Fallback color if no image
				const canvas = document.createElement('canvas')
				canvas.width = size
				canvas.height = size
				const ctx = canvas.getContext('2d')
				ctx!.fillStyle = `hsl(${(i * 360) / playlists.length}, 70%, 50%)`
				ctx!.fillRect(0, 0, size, size)

				const imageData = ctx!.getImageData(0, 0, size, size)
				const offset = i * size * size * 4
				data.set(imageData.data, offset)
				newTexture.needsUpdate = true
				return
			}

			const img = new Image()
			img.crossOrigin = 'anonymous'

			img.onload = async () => {
				const canvas = document.createElement('canvas')
				canvas.width = size
				canvas.height = size
				const ctx = canvas.getContext('2d')
				ctx!.drawImage(img, 0, 0, size, size)

				const imageData = ctx!.getImageData(0, 0, size, size)
				const offset = i * size * size * 4
				data.set(imageData.data, offset)

				loadedCount++
				newTexture.needsUpdate = true

				if (loadedCount === playlists.length - 1) {
					console.log('loading playlist images complete')
					setTimeout(() => {
						sceneStoreActions.setPlaylistsSceneStatus("opening")
					}, 750)
					let trigger = false
					await sceneStoreActions.animatePlaylistsMaterialBlend({
						config: {
							duration: 2500
						},
						// @ts-expect-error react spring mismatched onChange type
						onChange: (result: number) => {
							if (!trigger && result >= 0.75) {
								trigger = true
								void sceneStoreActions.animatePlaylistsSceneBlend({
									config: {
										duration: 1000
									},
									to: 1
								})
							}
						},
						to: 1
					})
				}
			}

			img.onerror = () => {
				console.warn(`Failed to load image for playlist: ${playlist.name}`)

				// Fallback color on error
				const canvas = document.createElement('canvas')
				canvas.width = size
				canvas.height = size
				const ctx = canvas.getContext('2d')
				ctx!.fillStyle = `hsl(${(i * 360) / playlists.length}, 70%, 50%)`
				ctx!.fillRect(0, 0, size, size)

				const imageData = ctx!.getImageData(0, 0, size, size)
				const offset = i * size * size * 4
				data.set(imageData.data, offset)
				newTexture.needsUpdate = true
			}

			img.src = imageUrl
		})

		return () => {
			newTexture.dispose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playlists])

	return texture
}
