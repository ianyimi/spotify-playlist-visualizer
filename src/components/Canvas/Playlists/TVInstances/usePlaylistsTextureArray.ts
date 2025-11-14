import { useEffect, useRef } from "react"
import { DataArrayTexture, LinearFilter, RGBAFormat } from "three"

import type { Playlist } from "~/convex/types"

export function usePlaylistsTextureArray(playlists: Playlist[]) {
	const textureRef = useRef<DataArrayTexture>(null)

	useEffect(() => {
		if (!playlists || playlists.length === 0) { return }

		const size = 512
		const depth = playlists.length

		const data = new Uint8Array(size * size * depth * 4)
		const texture = new DataArrayTexture(data, size, size, depth)
		texture.format = RGBAFormat
		texture.minFilter = LinearFilter
		texture.magFilter = LinearFilter
		texture.needsUpdate = true

		textureRef.current = texture

		playlists.forEach((playlist, i) => {
			const imageUrl = playlist.images?.[0]?.url
			if (!imageUrl) { return }

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

				texture.needsUpdate = true
			}

			img.src = imageUrl
		})

		return () => {
			texture.dispose()
		}
	}, [playlists])

	return textureRef.current
}
