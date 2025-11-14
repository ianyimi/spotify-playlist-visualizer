import type { ThreeElements } from "@react-three/fiber"
import type { ReactNode } from "react"

import type { TransitionMaterialProps } from "~/components/TransitionMaterial"

export type GroupProps = ThreeElements["group"]
export type PickRequired<T, Required extends keyof T> = Partial<Omit<T, Required>> & Pick<T, Required>
export type ShaderMaterialProps = ThreeElements["shaderMaterial"]

declare module "@react-three/fiber" {
	interface ThreeElements {
		transitionMaterial: Omit<TransitionMaterialProps, "children"> & ShaderMaterialProps & { children?: ReactNode }
	}
}

export { }
