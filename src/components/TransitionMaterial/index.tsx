import { useValue } from "@legendapp/state/react";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { type ReactNode, useRef } from "react";
import { type ShaderMaterial, type Texture, Uniform } from "three";

import { useFramerate } from "~/hooks/useFramerate";
import { $sceneStore } from "~/stores/scene";

import fragmentShader from "./frag.glsl"
import vertexShader from "./vert.glsl"

const TransitionMaterialImpl = shaderMaterial(
	{
		textureA: null,
		textureB: null,
		transitionProgress: 0,
	},
	vertexShader,
	fragmentShader
)

extend({ TransitionMaterial: TransitionMaterialImpl })

export interface TransitionMaterialProps {
	children?: ReactNode
	textureA?: null | Texture
	textureB?: null | Texture
	transitionProgress?: number
}

export default function TransitionMaterial({
	children,
	textureA,
	textureB,
	transitionProgress
}: TransitionMaterialProps) {
	const stateTransitionProgress = useValue($sceneStore.sceneDepth.transitionProgress)
	const shaderMaterial = useRef<ShaderMaterial>(null)
	useFramerate(30, () => {
		if (!shaderMaterial.current || transitionProgress !== undefined) { return }
		shaderMaterial.current.uniforms.transitionProgress = new Uniform(stateTransitionProgress.get())
	})
	return (
		<transitionMaterial
			ref={shaderMaterial}
			textureA={textureA}
			textureB={textureB}
			transitionProgress={transitionProgress ?? stateTransitionProgress.get()}
		>
			{children}
		</transitionMaterial>
	)
}
