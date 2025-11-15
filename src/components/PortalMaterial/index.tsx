// Authors:
//   N8, https://twitter.com/N8Programs
//   drcmda, https://twitter.com/0xca0a
// https://github.com/N8python/maskBlur

import { RenderTexture, useFBO, useIntersect } from '@react-three/drei'
import { extend, type ReactThreeFiber, type ThreeElements, useFrame, useThree } from '@react-three/fiber'
import {
	forwardRef,
	type ForwardRefExoticComponent,
	type PropsWithoutRef,
	type RefAttributes,
	type RefObject,
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import {
	Box3,
	type BufferAttribute,
	FloatType,
	type GLSLVersion,
	type IUniform,
	LinearFilter,
	LinearMipmapLinearFilter,
	Mesh,
	MeshBasicMaterial,
	NearestFilter,
	OrthographicCamera,
	RedFormat,
	REVISION,
	type Scene,
	ShaderMaterial,
	type Texture,
	Vector2,
	type WebGLRenderer,
	WebGLRenderTarget
} from 'three'
import { FullScreenQuad } from 'three-stdlib'

import { shaderMaterial } from '~/utils/shaderMaterial'

import frag from "./frag.glsl"
import vert from "./vert.glsl"

type ForwardRefComponent<P, T> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>

const version = parseInt(REVISION.replace(/\D+/g, ''))

const PortalMaterialImpl = /* @__PURE__ */ shaderMaterial(
	{
		blend: 0,
		blur: 0,
		map: null,
		resolution: /* @__PURE__ */ new Vector2(),
		sdf: null,
		size: 0,
	},
	`varying vec2 vUv;
   void main() {
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
     vUv = uv;
   }`,
	`uniform sampler2D sdf;
   uniform sampler2D map;
   uniform float blur;
   uniform float size;
   uniform float time;
   uniform vec2 resolution;
   varying vec2 vUv;
   #include <packing>
   void main() {
     vec2 uv = gl_FragCoord.xy / resolution.xy;
     vec4 t = texture2D(map, uv);
     float k = blur;
     float d = texture2D(sdf, vUv).r/size;
     float alpha = 1.0 - smoothstep(0.0, 1.0, clamp(d/k + 1.0, 0.0, 1.0));
     gl_FragColor = vec4(t.rgb, blur == 0.0 ? t.a : t.a * alpha);
     #include <tonemapping_fragment>
     #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
   }`
)

declare module '@react-three/fiber' {
	interface ThreeElements {
		portalMaterialImpl: ThreeElements['shaderMaterial'] & {
			blend: number
			blur: number
			map?: Texture
			resolution: ReactThreeFiber.Vector2
			sdf?: Texture
			size?: number
		}
	}
}

export type PortalProps = Omit<ThreeElements['portalMaterialImpl'], 'blend' | 'ref'> & {
	altScene?: ThreeElements['portalMaterialImpl']["children"];
	/** Mix the portals own scene with the world scene, 0 = world scene render,
	 *  0.5 = both scenes render, 1 = portal scene renders, defaults to 0 */
	blend?: number
	/** Edge fade blur, 0 = no blur (default) */
	blur?: number
	/** Optional event priority, defaults to 0 */
	eventPriority?: number

	/** Optionally diable events inside the portal, defaults to false */
	events?: boolean
	/** Optionally provide a render target (attach) for the portal scene RenderTexture Material to use */
	portalSceneRenderTarget?: string;
	/** Optional render priority, defaults to 0 */
	renderPriority?: number
	/** SDF resolution, the smaller the faster is the start-up time (default: 512) */
	resolution?: number

	/** Optionally provide a fragment shader for the RenderTexture Material to use */
	transitionFragmentShader?: string;
	/** Optionally provide a vertex shader for the RenderTexture Material to use */
	transitionVertexShader?: string;

	/** By default portals use relative coordinates, contents are affects by the local matrix transform */
	worldUnits?: boolean
}

const PortalMaterial: ForwardRefComponent<PortalProps, ThreeElements['portalMaterialImpl']> =
  // eslint-disable-next-line react/display-name
  /* @__PURE__ */ forwardRef(
	(
		{
			altScene,
			blur = 0,
			children,
			eventPriority = 0,
			events = undefined,
			glslVersion,
			portalSceneRenderTarget,
			renderPriority = 0,
			resolution = 512,
			transitionFragmentShader,
			transitionVertexShader,
			uniforms,
			worldUnits = false,
			...props
		},
		fref
	) => {
		extend({ PortalMaterialImpl })

		const ref = useRef<ThreeElements['portalMaterialImpl']>(null!)
		const { gl, scene, setEvents, size, viewport } = useThree()
		const maskRenderTarget = useFBO(resolution, resolution)

		const [priority, setPriority] = useState(0)
		useFrame(() => {
			// If blend is > 0 then the portal is being entered, the render-priority must change
			const p = ref.current.blend > 0 ? Math.max(1, renderPriority) : 0
			if (priority !== p) { setPriority(p) }
		})

		useEffect(() => {
			if (events !== undefined) { setEvents({ enabled: !events }) }
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [events])

		const [visible, setVisible] = useState(true)
		// See if the parent mesh is in the camera frustum
		const parent = useIntersect(setVisible)
		useLayoutEffect(() => {
			// Since the ref above is not tied to a mesh directly (we're inside a material),
			// it has to be tied to the parent mesh here
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			parent.current = (ref.current as any)?.__r3f.parent?.object
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [])

		useLayoutEffect(() => {
			if (!parent.current) { return }

			// Apply the SDF mask only once
			if (blur && ref.current.sdf === null) {
				// @ts-expect-error copied src from drei repo
				const tempMesh = new Mesh(parent.current.geometry, new MeshBasicMaterial())
				const boundingBox = new Box3().setFromBufferAttribute(
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					tempMesh.geometry.attributes.position as BufferAttribute
				)
				const orthoCam = new OrthographicCamera(
					boundingBox.min.x * (1 + 2 / resolution),
					boundingBox.max.x * (1 + 2 / resolution),
					boundingBox.max.y * (1 + 2 / resolution),
					boundingBox.min.y * (1 + 2 / resolution),
					0.1,
					1000
				)
				orthoCam.position.set(0, 0, 1)
				orthoCam.lookAt(0, 0, 0)

				gl.setRenderTarget(maskRenderTarget)
				gl.render(tempMesh, orthoCam)
				const sg = makeSDFGenerator(resolution, resolution, gl)
				const sdf = sg(maskRenderTarget.texture)
				const readSdf = new Float32Array(resolution * resolution)
				gl.readRenderTargetPixels(sdf, 0, 0, resolution, resolution, readSdf)
				// Get smallest value in sdf
				let min = Infinity
				// eslint-disable-next-line @typescript-eslint/prefer-for-of
				for (let i = 0; i < readSdf.length; i++) {
					// @ts-expect-error copied from drei src code
					if (readSdf[i] < min) { min = readSdf[i] }
				}
				min = -min
				ref.current.size = min
				ref.current.sdf = sdf.texture

				gl.setRenderTarget(null)
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [resolution, blur])

		useImperativeHandle(fref, () => ref.current)

		// @ts-expect-error copied from drei src
		// eslint-disable-next-line @typescript-eslint/no-unused-vars 
		const compute = useCallback((event, state, previous) => {
			if (!parent.current) { return false }
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			state.pointer.set((event.offsetX / state.size.width) * 2 - 1, -(event.offsetY / state.size.height) * 2 + 1)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			state.raycaster.setFromCamera(state.pointer, state.camera)

			if (ref.current?.blend === 0) {
				// We run a quick check against the parent, if it isn't hit there's no need to raycast at all
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				const [intersection] = state.raycaster.intersectObject(parent.current)
				if (!intersection) {
					// Cancel out the raycast camera if the parent mesh isn't hit
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					state.raycaster.camera = undefined
					return false
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [])

		return (
			<portalMaterialImpl
				attach="material"
				blend={0}
				blur={blur}
				ref={ref}
				resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
				{...props}
			>
				{altScene}
				<RenderTexture
					attach={portalSceneRenderTarget ?? "map"}
					compute={compute}
					eventPriority={eventPriority}
					frames={visible ? Infinity : 0}
					renderPriority={renderPriority}
				>
					{children}
					<ManagePortalScene
						events={events}
						fragmentShader={transitionFragmentShader}
						glslVersion={glslVersion ?? "100"}
						material={ref}
						priority={priority}
						rootScene={scene}
						uniforms={uniforms}
						vertexShader={transitionVertexShader}
						worldUnits={worldUnits}
					/>
				</RenderTexture>
			</portalMaterialImpl>
		)
	}
)

function ManagePortalScene({
	events = undefined,
	fragmentShader,
	glslVersion,
	material,
	priority,
	rootScene,
	uniforms = {},
	vertexShader,
	worldUnits,
}: {
	events?: boolean;
	fragmentShader?: string;
	glslVersion?: GLSLVersion;
	material: RefObject<ThreeElements['portalMaterialImpl']>
	priority: number;
	rootScene: Scene;
	uniforms?: Record<string, IUniform<unknown>>;
	vertexShader?: string;
	worldUnits: boolean;
}) {
	const scene = useThree((state) => state.scene)
	const setEvents = useThree((state) => state.setEvents)
	const buffer1 = useFBO()
	const buffer2 = useFBO()

	useLayoutEffect(() => {
		scene.matrixAutoUpdate = false
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (events !== undefined) { setEvents({ enabled: events }) }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [events])

	const [quad, blend] = useMemo(() => {
		// This fullscreen-quad is used to blend the two textures
		const blend = { value: 0 }
		const quad = new FullScreenQuad(
			new ShaderMaterial({
				fragmentShader: /*glsl*/ fragmentShader ?? frag,
				glslVersion,
				uniforms: {
					a: { value: buffer1.texture },
					b: { value: buffer2.texture },
					blend,
					...uniforms
				},
				vertexShader: /*glsl*/ vertexShader ?? vert
			})
		)
		return [quad, blend]
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useFrame((state) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
		const parent = (material?.current as any)?.__r3f.parent?.object
		quad.material.uniforms.uTime!.value += 0.01
		if (parent) {
			// Move portal contents along with the parent if worldUnits is true
			if (!worldUnits) {
				// If the portal renders exclusively the original scene needs to be updated
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				if (priority && material.current?.blend === 1) { parent.updateWorldMatrix(true, false) }
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
				scene.matrixWorld.copy(parent.matrixWorld)
			} else { scene.matrixWorld.identity() }

			// This bit is only necessary if the portal is blended, now it has a render-priority
			// and will take over the render loop
			if (priority) {
				if (material.current?.blend > 0 && material.current?.blend < 1) {
					// If blend is ongoing (> 0 and < 1) then we need to render both the root scene
					// and the portal scene, both will then be mixed in the quad from above
					blend.value = material.current.blend
					state.gl.setRenderTarget(buffer1)
					state.gl.render(scene, state.camera)
					state.gl.setRenderTarget(buffer2)
					state.gl.render(rootScene, state.camera)
					state.gl.setRenderTarget(null)
					quad.render(state.gl)
				} else if (material.current?.blend === 1) {
					// However if blend is 1 we only need to render the portal scene
					state.gl.render(scene, state.camera)
				}
			}
		}
	}, priority)
	return <></>
}

export default PortalMaterial;

const makeSDFGenerator = (clientWidth: number, clientHeight: number, renderer: WebGLRenderer) => {
	const finalTarget = new WebGLRenderTarget(clientWidth, clientHeight, {
		type: FloatType,
		format: RedFormat,
		generateMipmaps: true,
		magFilter: LinearFilter,
		minFilter: LinearMipmapLinearFilter,
	})
	const outsideRenderTarget = new WebGLRenderTarget(clientWidth, clientHeight, {
		magFilter: NearestFilter,
		minFilter: NearestFilter,
	})
	const insideRenderTarget = new WebGLRenderTarget(clientWidth, clientHeight, {
		magFilter: NearestFilter,
		minFilter: NearestFilter,
	})
	const outsideRenderTarget2 = new WebGLRenderTarget(clientWidth, clientHeight, {
		magFilter: NearestFilter,
		minFilter: NearestFilter,
	})
	const insideRenderTarget2 = new WebGLRenderTarget(clientWidth, clientHeight, {
		magFilter: NearestFilter,
		minFilter: NearestFilter,
	})
	const outsideRenderTargetFinal = new WebGLRenderTarget(clientWidth, clientHeight, {
		type: FloatType,
		format: RedFormat,
		magFilter: NearestFilter,
		minFilter: NearestFilter,
	})
	const insideRenderTargetFinal = new WebGLRenderTarget(clientWidth, clientHeight, {
		type: FloatType,
		format: RedFormat,
		magFilter: NearestFilter,
		minFilter: NearestFilter,
	})
	const uvRender = new FullScreenQuad(
		new ShaderMaterial({
			fragmentShader: /*glsl*/ `
        uniform sampler2D tex;
        varying vec2 vUv;
        #include <packing>
        void main() {
          gl_FragColor = pack2HalfToRGBA(vUv * (round(texture2D(tex, vUv).x)));
        }`,
			uniforms: { tex: { value: null } },
			vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
		})
	)
	const uvRenderInside = new FullScreenQuad(
		new ShaderMaterial({
			fragmentShader: /*glsl*/ `
        uniform sampler2D tex;
        varying vec2 vUv;
        #include <packing>
        void main() {
          gl_FragColor = pack2HalfToRGBA(vUv * (1.0 - round(texture2D(tex, vUv).x)));
        }`,
			uniforms: { tex: { value: null } },
			vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
		})
	)
	const jumpFloodRender = new FullScreenQuad(
		new ShaderMaterial({
			fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        uniform sampler2D tex;
        uniform float offset;
        uniform float level;
        uniform float maxSteps;
        #include <packing>
        void main() {
          float closestDist = 9999999.9;
          vec2 closestPos = vec2(0.0);
          for (float x = -1.0; x <= 1.0; x += 1.0) {
            for (float y = -1.0; y <= 1.0; y += 1.0) {
              vec2 voffset = vUv;
              voffset += vec2(x, y) * vec2(${1 / clientWidth}, ${1 / clientHeight}) * offset;
              vec2 pos = unpackRGBATo2Half(texture2D(tex, voffset));
              float dist = distance(pos.xy, vUv);
              if(pos.x != 0.0 && pos.y != 0.0 && dist < closestDist) {
                closestDist = dist;
                closestPos = pos;
              }
            }
          }
          gl_FragColor = pack2HalfToRGBA(closestPos);
        }`,
			uniforms: {
				level: { value: 0.0 },
				maxSteps: { value: 0.0 },
				offset: { value: 0.0 },
				tex: { value: null },
			},
			vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
		})
	)
	const distanceFieldRender = new FullScreenQuad(
		new ShaderMaterial({
			fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        uniform sampler2D tex;
        uniform vec2 size;
        #include <packing>
        void main() {
          gl_FragColor = vec4(distance(size * unpackRGBATo2Half(texture2D(tex, vUv)), size * vUv), 0.0, 0.0, 0.0);
        }`,
			uniforms: {
				size: { value: new Vector2(clientWidth, clientHeight) },
				tex: { value: null },
			},
			vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
		})
	)
	const compositeRender = new FullScreenQuad(
		new ShaderMaterial({
			fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        uniform sampler2D inside;
        uniform sampler2D outside;
        uniform sampler2D tex;
        #include <packing>
        void main() {
          float i = texture2D(inside, vUv).x;
          float o =texture2D(outside, vUv).x;
          if (texture2D(tex, vUv).x == 0.0) {
            gl_FragColor = vec4(o, 0.0, 0.0, 0.0);
          } else {
            gl_FragColor = vec4(-i, 0.0, 0.0, 0.0);
          }
        }`,
			uniforms: {
				inside: { value: insideRenderTargetFinal.texture },
				outside: { value: outsideRenderTargetFinal.texture },
				tex: { value: null },
			},
			vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
		})
	)

	return (image: Texture) => {
		const ft = finalTarget
		image.minFilter = NearestFilter
		image.magFilter = NearestFilter
		uvRender.material.uniforms.tex!.value = image
		renderer.setRenderTarget(outsideRenderTarget)
		uvRender.render(renderer)

		const passes = Math.ceil(Math.log(Math.max(clientWidth, clientHeight)) / Math.log(2.0))
		let lastTarget = outsideRenderTarget
		let target: WebGLRenderTarget = null!
		for (let i = 0; i < passes; i++) {
			const offset = Math.pow(2, passes - i - 1)
			target = lastTarget === outsideRenderTarget ? outsideRenderTarget2 : outsideRenderTarget
			jumpFloodRender.material.uniforms.level!.value = i
			jumpFloodRender.material.uniforms.maxSteps!.value = passes
			jumpFloodRender.material.uniforms.offset!.value = offset
			jumpFloodRender.material.uniforms.tex!.value = lastTarget.texture
			renderer.setRenderTarget(target)
			jumpFloodRender.render(renderer)
			lastTarget = target
		}
		renderer.setRenderTarget(outsideRenderTargetFinal)
		distanceFieldRender.material.uniforms.tex!.value = target.texture
		distanceFieldRender.render(renderer)
		uvRenderInside.material.uniforms.tex!.value = image
		renderer.setRenderTarget(insideRenderTarget)
		uvRenderInside.render(renderer)
		lastTarget = insideRenderTarget

		for (let i = 0; i < passes; i++) {
			const offset = Math.pow(2, passes - i - 1)
			target = lastTarget === insideRenderTarget ? insideRenderTarget2 : insideRenderTarget
			jumpFloodRender.material.uniforms.level!.value = i
			jumpFloodRender.material.uniforms.maxSteps!.value = passes
			jumpFloodRender.material.uniforms.offset!.value = offset
			jumpFloodRender.material.uniforms.tex!.value = lastTarget.texture
			renderer.setRenderTarget(target)
			jumpFloodRender.render(renderer)
			lastTarget = target
		}
		renderer.setRenderTarget(insideRenderTargetFinal)
		distanceFieldRender.material.uniforms.tex!.value = target.texture
		distanceFieldRender.render(renderer)
		renderer.setRenderTarget(ft)
		compositeRender.material.uniforms.tex!.value = image
		compositeRender.render(renderer)
		renderer.setRenderTarget(null)
		return ft
	}
}
