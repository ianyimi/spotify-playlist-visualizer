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
					sceneStoreActions.pushPlaylistsCameraDirection("left")
					break;
				case "w":
				case "ArrowUp":
					sceneStoreActions.pushPlaylistsCameraDirection("up")
					break;
				case "s":
				case "ArrowDown":
					sceneStoreActions.pushPlaylistsCameraDirection("down")
					break;
				case "d":
				case "ArrowRight":
					sceneStoreActions.pushPlaylistsCameraDirection("right")
					break;
			}
		}
		function handleKeyUp(this: Document, ev: KeyboardEvent) {
			switch (ev.key) {
				case "a":
				case "ArrowLeft":
					sceneStoreActions.removePlaylistsCameraDirection("left")
					break;
				case "w":
				case "ArrowUp":
					sceneStoreActions.removePlaylistsCameraDirection("up")
					break;
				case "s":
				case "ArrowDown":
					sceneStoreActions.removePlaylistsCameraDirection("down")
					break;
				case "d":
				case "ArrowRight":
					sceneStoreActions.removePlaylistsCameraDirection("right")
					break;
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
