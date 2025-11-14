import { useEffect, useState } from "react"
import { DataArrayTexture, LinearFilter, RGBAFormat } from "three"

import type { Playlist } from "~/convex/types"

export function usePlaylistsTextureArray(playlists: Playlist[]) {
	const [texture, setTexture] = useState<DataArrayTexture | null>(null)

	useEffect(() => {
		if (!playlists || playlists.length === 0) { return }

		const size = 512
		const depth = playlists.length

		console.log(`Creating texture array for ${depth} playlists`)

		const data = new Uint8Array(size * size * depth * 4)
		const newTexture = new DataArrayTexture(data, size, size, depth)
		newTexture.format = RGBAFormat
		newTexture.minFilter = LinearFilter
		newTexture.magFilter = LinearFilter

		setTexture(newTexture)

		console.log('Texture array created:', {
			width: newTexture.image.width,
			depth: newTexture.image.depth,
			format: newTexture.format,
			height: newTexture.image.height
		})

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

			img.onload = () => {
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

				if (loadedCount % 10 === 0 || loadedCount === playlists.length) {
					console.log(`Loaded ${loadedCount}/${playlists.length} playlist images`)
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
	}, [playlists])

	return texture
}
