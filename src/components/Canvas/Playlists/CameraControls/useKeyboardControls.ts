import { useValue } from "@legendapp/state/react";
import { useEffect } from "react";

import { $sceneStoreActions } from "~/stores/scene";


export function useKeyboardControls() {

	const sceneStoreActions = useValue($sceneStoreActions)

	useEffect(() => {
		function handleKeyDown(this: Document, ev: KeyboardEvent) {
			switch (ev.key) {
				case "a":
				case "ArrowLeft":
					sceneStoreActions.setPlaylistsCameraDirection("left")
					break;
				case "w":
				case "ArrowUp":
					sceneStoreActions.setPlaylistsCameraDirection("up")
					break;
				case "s":
				case "ArrowDown":
					sceneStoreActions.setPlaylistsCameraDirection("down")
					break;
				case "d":
				case "ArrowRight":
					sceneStoreActions.setPlaylistsCameraDirection("right")
					break;
			}
		}
		function handleKeyUp(this: Document, ev: KeyboardEvent) {
			const validKeys = ["a", "w", "s", "d", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"]
			if (validKeys.includes(ev.key)) {
				sceneStoreActions.setPlaylistsCameraDirection("idle")
			}
		}
		document.addEventListener("keydown", handleKeyDown)
		document.addEventListener("keyup", handleKeyUp)
		return () => {
			document.removeEventListener("keydown", handleKeyDown)
			document.removeEventListener("keyup", handleKeyUp)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
