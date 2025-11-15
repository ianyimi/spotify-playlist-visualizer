import { type ConstructorRepresentation } from '@react-three/fiber'
import * as THREE from 'three'
import { type MeshBVHUniformStruct } from 'three-mesh-bvh'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type Uniforms = Record<string, Array<UniformValue> | Record<string, UniformValue> | UniformValue>

type UniformValue =
	| boolean
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	| MeshBVHUniformStruct // TODO: remove?
	| null
	| number
	| THREE.Color
	| THREE.Matrix3
	| THREE.Matrix4
	| THREE.Quaternion
	| THREE.Texture
	| THREE.TypedArray
	| THREE.Vector2
	| THREE.Vector3
	| THREE.Vector4

export function shaderMaterial<U extends Uniforms, M extends THREE.ShaderMaterial & U>(
	uniforms: U,
	vertexShader: string,
	fragmentShader: string,
	onInit?: (material?: M) => void
) {
	return class extends THREE.ShaderMaterial {
		static key = THREE.MathUtils.generateUUID()

		constructor(parameters?: THREE.ShaderMaterialParameters) {
			super({ fragmentShader, vertexShader, ...parameters })

			for (const key in uniforms) {
				this.uniforms[key] = new THREE.Uniform(uniforms[key])
				Object.defineProperty(this, key, {
					get() {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
						return this.uniforms[key].value
					},
					set(value) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
						this.uniforms[key].value = value
					},
				})
			}
			this.uniforms = THREE.UniformsUtils.clone(this.uniforms)

			onInit?.(this as unknown as M)
		}
	} as unknown as ConstructorRepresentation<M> & { key: string }
}
