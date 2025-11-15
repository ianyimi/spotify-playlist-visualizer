import { useValue } from "@legendapp/state/react";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { type ReactNode, useRef } from "react";
import { type ShaderMaterial, type Texture, Vector2 } from "three";

import { useFramerate } from "~/hooks/useFramerate";
import { $sceneStore } from "~/stores/scene";

import fragmentShader from "./frag.glsl"
import vertexShader from "./vert.glsl"

const TransitionMaterialImpl = shaderMaterial(
	{
		uResolution: new Vector2(window.innerWidth, window.innerHeight),
		uTextureA: null,
		uTextureB: null,
		uTime: 0,
		uTransitionProgress: 0
	},
	vertexShader,
	fragmentShader
)

extend({ TransitionMaterial: TransitionMaterialImpl })

export interface TransitionMaterialProps {
	children?: ReactNode
	uResolution?: Vector2
	uTextureA?: null | Texture
	uTextureB?: null | Texture
	uTransitionProgress?: number
}

export default function TransitionMaterial({
	children,
	uTextureA,
	uTextureB,
	uTransitionProgress
}: TransitionMaterialProps) {
	const stateTransitionProgress = useValue($sceneStore.sceneDepth.transitionProgress)
	const shaderMaterial = useRef<ShaderMaterial>(null)

	useFramerate(30, () => {
		if (!shaderMaterial.current) { return }
		shaderMaterial.current.uniforms.uTime!.value += 0.00001;
		if (uTransitionProgress !== undefined) { return }
		shaderMaterial.current.uniforms.uTransitionProgress!.value = stateTransitionProgress.get()
	})

	return (
		<transitionMaterial
			ref={shaderMaterial}
			uTextureA={uTextureA}
			uTextureB={uTextureB}
			uTransitionProgress={uTransitionProgress ?? stateTransitionProgress.get()}
		>
			{children}
		</transitionMaterial>
	)
}
