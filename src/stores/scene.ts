import { observable } from "@legendapp/state";
import { SpringValue } from "@react-spring/web"

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

interface SceneStore {
	playlists: {
		materialBlend: SpringValue<number>
		materialBlendValue: number
		sceneBlend: SpringValue<number>
	},
	sceneReady: boolean;
}

export const $sceneStore = observable<SceneStore>({
	playlists: {
		materialBlend: new SpringValue(0, {
			config: {
				duration: 1500,
				friction: 3,
				mass: 2
			},
			// @ts-expect-error react spring mismatched onChange type
			onChange: (result: number) => {
				$sceneStore.playlists.materialBlendValue.set(result)
			}
		}),
		materialBlendValue: 0,
		sceneBlend: new SpringValue(0, {
			config: {
				duration: 1500,
				friction: 3,
				mass: 5
			}
		})
	},
	sceneReady: false,
});

interface SceneStoreActions {
	animatePlaylistsMaterialBlend: () => Promise<void>
	setSceneReady: () => void
}

export const $sceneStoreActions = observable<SceneStoreActions>({
	animatePlaylistsMaterialBlend: async () => {
		const playlistsMaterialBlend = $sceneStore.playlists.materialBlend.get()
		if (playlistsMaterialBlend.get() === 0) {
			console.log('animating blend value to 1')
			await playlistsMaterialBlend.start(1)
		} else if (playlistsMaterialBlend.get() === 1) {
			console.log('animating blend value to 0')
			await playlistsMaterialBlend.start(0)
		}
	},
	setSceneReady: () => {
		$sceneStore.sceneReady.set(true)
	}
})

