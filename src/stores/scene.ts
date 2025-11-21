import type { Camera } from "three";

import { observable } from "@legendapp/state";
import { type SpringUpdate, SpringValue } from "@react-spring/web"

// Scene depth levels:
// 0 = Login TV (outermost)
// 1 = Playlists TVs scene
// 2 = Individual playlist tracks scene
export type SceneDepth = 0 | 1 | 2;

export type TransitionState =
	| "completed"      // Transition complete, ready for interaction
	| "idle"           // No transition happening
	| "loading"        // Loading data for next scene
	| "transitioning"  // Shader transition + camera animation in progress

export const SCENE_STATUSES = {
	closed: "closed",
	closing: "closing",
	open: "open",
	opening: "opening"
} as const
export type PlaylistsCameraDirection = SceneStore["playlists"]["camera"]["direction"]

export type SceneStatus = typeof SCENE_STATUSES[keyof typeof SCENE_STATUSES]

interface SceneStore {
	camera?: Camera,
	playlists: {
		camera: {
			direction: "down" | "idle" | "left" | "right" | "up"
			maxX: number,
			maxY: number
			minX: number,
			minY: number,
		}
		materialBlend: SpringValue<number>
		sceneBlend: SpringValue<number>
		sceneStatus: SceneStatus;
	},
	sceneReady: boolean;
}

export const $sceneStore = observable<SceneStore>({
	playlists: {
		camera: {
			direction: "idle",
			maxX: 0,
			maxY: 0,
			minX: 0,
			minY: 0
		},
		materialBlend: new SpringValue(0, {
			config: {
				duration: 1500,
				friction: 3,
				mass: 2
			},
		}),
		sceneBlend: new SpringValue(0, {
			config: {
				duration: 1500,
				friction: 3,
				mass: 5,
			},
		}),
		sceneStatus: SCENE_STATUSES.closed,
	},
	sceneReady: false,
});

interface SceneStoreActions {
	animatePlaylistsMaterialBlend: (props?: SpringUpdate<number>) => Promise<void>
	animatePlaylistsSceneBlend: (props?: SpringUpdate<number>) => Promise<void>
	getPlaylistsMaterialBlendValue: () => number
	getPlaylistsSceneBlendValue: () => number
	setCamera: (camera: Camera) => void
	setPlaylistsCameraBounds: ({ maxX, maxY, minX, minY }: { maxX: number, maxY: number; minX: number, minY: number, }) => void
	setPlaylistsCameraDirection: (direction: PlaylistsCameraDirection) => void
	setPlaylistsSceneStatus: (status: SceneStatus) => void
	setSceneReady: () => void
}

export const $sceneStoreActions = observable<SceneStoreActions>({
	animatePlaylistsMaterialBlend: async (props) => {
		const playlistsMaterialBlend = $sceneStore.playlists.materialBlend.get()

		await playlistsMaterialBlend.start({
			to: playlistsMaterialBlend.get() === 0 ? 1 : 0,
			...props
		})
	},
	animatePlaylistsSceneBlend: async (props) => {
		const playlistsSceneBlend = $sceneStore.playlists.sceneBlend.get()
		await playlistsSceneBlend.start({
			to: playlistsSceneBlend.get() === 0 ? 1 : 0,
			...props
		})
	},
	getPlaylistsMaterialBlendValue: () => {
		return $sceneStore.playlists.materialBlend.get().get()
	},
	getPlaylistsSceneBlendValue: () => {
		return $sceneStore.playlists.sceneBlend.get().get()
	},
	setCamera: (camera: Camera) => {
		$sceneStore.camera.set(camera)
	},
	setPlaylistsCameraBounds: ({ maxX, maxY, minX, minY }) => {
		$sceneStore.playlists.camera.set({
			direction: $sceneStore.playlists.camera.direction.get(),
			maxX,
			maxY,
			minX,
			minY
		})
	},
	setPlaylistsCameraDirection: (direction) => {
		$sceneStore.playlists.camera.direction.set(direction)
	},
	setPlaylistsSceneStatus: (status) => {
		$sceneStore.playlists.sceneStatus.set(status)
	},
	setSceneReady: () => {
		$sceneStore.sceneReady.set(true)
	}
})

