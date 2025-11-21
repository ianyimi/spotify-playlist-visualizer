import { Instance } from "@react-three/drei";

import type { Playlist } from "~/convex/types";
import type { GroupProps } from "~/types";

import { getInstancePosition } from ".";

interface InstancedScreenMaterialProps extends GroupProps {
	index: number
	playlist: Playlist;
	playlistCount: number
}

export default function InstancedScreenMaterial({ index, playlistCount }: InstancedScreenMaterialProps) {

	function handleHover() {
		console.log('hover: ', index)
	}
	function handleUnhover() {
		console.log('unhover: ', index)
	}
	function handleClick() {
		console.log('handleClick')
	}

	return (
		<>
			<Instance
				key={`tv-screen-instance-${index}`}
				onClick={handleClick}
				onPointerEnter={handleHover}
				onPointerMove={handleUnhover}
				onPointerOut={handleUnhover}
				onPointerOver={handleHover}
				position={getInstancePosition({ index, offsets: [-0.0011, 0.0054, -0.0071], total: playlistCount })}
				scale={5.0809}
			/>
		</>
	)
}
