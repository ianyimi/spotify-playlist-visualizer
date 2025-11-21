import { useValue } from "@legendapp/state/react"
import { useThree } from "@react-three/fiber"

import { useFramerate } from "~/hooks/useFramerate"
import { $sceneStore, SCENE_STATUSES } from "~/stores/scene"

import { useKeyboardControls } from "./useKeyboardControls"

export default function CameraControls() {
	const { camera } = useThree()
	const sceneStatus = useValue($sceneStore.playlists.sceneStatus)
	const cameraState = useValue($sceneStore.playlists.camera)

	useKeyboardControls()

	useFramerate(30, () => {
		if (sceneStatus !== SCENE_STATUSES.open) { return }
		const velocity = 0.75
		for (const direction of cameraState.directions) {
			switch (direction) {
				case "left":
					if (camera.position.x > cameraState.minX) {
						camera.position.x -= velocity
					}
					break;
				case "up":
					if (camera.position.y < cameraState.maxY) {
						camera.position.y += velocity
					}
					break;
				case "down":
					if (camera.position.y > cameraState.minY) {
						camera.position.y -= velocity
					}
					break;
				case "right":
					if (camera.position.x < cameraState.maxX) {
						camera.position.x += velocity
					}
					break;
			}
		}
	})

	return <></>
}
