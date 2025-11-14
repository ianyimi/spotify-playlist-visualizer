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
	camera: {
		isAnimating: boolean;
		targetPosition: [number, number, number] | null;
	};
	sceneDepth: {
		current: SceneDepth;
		max: 2;
		portalBlend: SpringValue<number>; // 0 or 1 for portal material blend
		target: SceneDepth;
		transitionProgress: SpringValue<number>; // 0 to 1 for shader transitions
	};
	sceneReady: boolean;
	status: string[];
	transition: {
		direction: "in" | "out" | null; // "in" = going deeper, "out" = going back
		state: TransitionState;
	};
}

export const $sceneStore = observable<SceneStore>({
	camera: {
		isAnimating: false,
		targetPosition: null,
	},
	sceneDepth: {
		current: 0,
		max: 2,
		portalBlend: new SpringValue(0),  // Hybrid approach: portal material blend
		target: 0,
		transitionProgress: new SpringValue(0)
	},
	sceneReady: false,
	status: [],
	transition: {
		direction: null,
		state: "idle",
	}
});

interface SceneStoreActions {
	endTransition: () => void;
	incept: () => Promise<void>;
	regress: () => Promise<void>;
	setCameraAnimating: (animating: boolean) => void;
	setTransitionState: (state: TransitionState) => void;
	startTransition: (targetDepth: SceneDepth) => void;
}

export const $sceneStoreActions = observable<SceneStoreActions>({
	incept: async () => {
		const currentDepth = $sceneStore.sceneDepth.current.get();
		const maxDepth = $sceneStore.sceneDepth.max.get();

		if (currentDepth < maxDepth) {
			await $sceneStore.sceneDepth.transitionProgress.get().start(1, {
				config: {
					duration: 2000
				},
				onRest: () => $sceneStoreActions.endTransition(),
				onStart: () => $sceneStoreActions.startTransition((currentDepth + 1) as SceneDepth)
			})
		}
	},

	regress: async () => {
		const currentDepth = $sceneStore.sceneDepth.current.get();

		if (currentDepth > 0) {
			await $sceneStore.sceneDepth.transitionProgress.get().start(0, {
				config: {
					duration: 2000
				},
				onRest: () => $sceneStoreActions.endTransition(),
				onStart: () => $sceneStoreActions.startTransition((currentDepth - 1) as SceneDepth)
			})
			$sceneStoreActions.startTransition((currentDepth - 1) as SceneDepth);
		}
	},

	setTransitionState: (state: TransitionState) => {
		$sceneStore.transition.state.set(state);
	},

	startTransition: (targetDepth: SceneDepth) => {
		const currentDepth = $sceneStore.sceneDepth.current.get();
		const direction = targetDepth > currentDepth ? "in" : "out";

		$sceneStore.sceneDepth.target.set(targetDepth);
		$sceneStore.transition.direction.set(direction);
		$sceneStore.transition.state.set("loading");
		$sceneStore.status.push("scene-transition-started");
	},

	endTransition: () => {
		const targetDepth = $sceneStore.sceneDepth.target.get();

		$sceneStore.sceneDepth.current.set(targetDepth);
		$sceneStore.transition.state.set("completed");
		$sceneStore.transition.direction.set(null);
		$sceneStore.status.set($sceneStore.status.filter(s => s.get() !== "scene-transition-started"));

		// Reset to idle after a brief moment
		setTimeout(() => {
			if ($sceneStore.transition.state.get() === "completed") {
				$sceneStore.transition.state.set("idle");
			}
		}, 100);
	},

	setCameraAnimating: (animating: boolean) => {
		$sceneStore.camera.isAnimating.set(animating);
	}
})

