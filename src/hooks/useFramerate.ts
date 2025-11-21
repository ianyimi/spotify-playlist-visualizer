import { type RootState, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function useFramerate(framerate: number, callback: (state: RootState) => void, renderPriority?: number) {
	const prevFrame = useRef(0);
	useFrame((state) => {
		const frameDelta = state.clock.getElapsedTime() - prevFrame.current;
		if (frameDelta >= 1 / framerate) {
			callback(state)
			prevFrame.current = state.clock.getElapsedTime()
		}
	}, renderPriority)
}
