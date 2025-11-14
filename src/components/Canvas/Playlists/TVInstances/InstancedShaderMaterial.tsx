import { Instance, useTexture } from "@react-three/drei";

import type { Playlist } from "~/convex/types";
import type { GroupProps } from "~/types";

import { GAPX, GAPY, ROW_LENGTH } from ".";

interface InstancedScreenMaterialProps extends GroupProps {
	index: number
	playlist: Playlist;
	playlistCount: number
}

export default function InstancedScreenMaterial({ index, playlist, playlistCount }: InstancedScreenMaterialProps) {
	const centerX = ROW_LENGTH * GAPX / 2
	const maxRows = Math.floor(playlistCount / ROW_LENGTH)
	const centerY = maxRows * GAPY / 2
	return (
		<>
			<Instance
				key={`tv-screen-instance-${index}`}
				position={[index % ROW_LENGTH * GAPX - 0.0011 - centerX, Math.floor(index / ROW_LENGTH) * -GAPY + 0.0054 + centerY, -0.0071]}
				scale={5.0809}
			/>
		</>
	)
}
