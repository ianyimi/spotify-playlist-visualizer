import { observable } from "@legendapp/state";

export interface SceneStore {
	sceneReady: boolean;
}

export const $sceneStore = observable<SceneStore>({
	sceneReady: false,
});


