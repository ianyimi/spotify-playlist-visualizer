import { useValue } from "@legendapp/state/react";
import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElements } from "@react-three/fiber";
import { type MutableRefObject, type ReactNode, useRef } from "react";
import { type ShaderMaterial, type Texture, Vector2 } from "three";

import type { ShaderMaterialProps } from "~/types";

import { useFramerate } from "~/hooks/useFramerate";
import { $sceneStore } from "~/stores/scene";

import fragmentShader from "./frag.glsl"
import vertexShader from "./vert.glsl"

const TransitionMaterialImpl = shaderMaterial(
	{
		blend: 0,
		blur: 0,
		resolution: new Vector2(window.innerWidth, window.innerHeight),
		uTextureA: null,
		uTextureB: null,
		uTime: 0,
	},
	vertexShader,
	fragmentShader
)

extend({ TransitionMaterial: TransitionMaterialImpl })

export interface TransitionMaterialProps {
	blend: number
	blur: number
	children?: ReactNode
	ref: MutableRefObject<ThreeElements["transitionMaterial"]>
	resolution: Vector2
	sdf?: Texture
	size?: number
	uTextureA?: null | Texture
	uTextureB?: null | Texture
}

export default function TransitionMaterial({
	blend,
	blur,
	children,
	ref,
	resolution,
	uTextureA,
	uTextureB,
}: TransitionMaterialProps) {
	useFramerate(30, () => {
		if (!ref.current || !ref.current.uniforms) { return }
		ref.current.uniforms.uTime!.value += 0.00001;
		// Don't override blend - it comes from the prop
		ref.current.uniforms.blend!.value = blend
	})

	return (
		<transitionMaterial
			blend={blend}
			blur={blur}
			ref={ref}
			resolution={resolution}
			uTextureA={uTextureA}
			uTextureB={uTextureB}
		>
			{children}
		</transitionMaterial>
	)
}
