"use client"

import { AdaptiveDpr, Bvh, useProgress } from "@react-three/drei"
import { Canvas, extend } from "@react-three/fiber"
import { useEffect, useState } from "react"
import * as THREE from "three"
import { Vector3 } from "three"

import InitialScene from "../Scenes"
import CameraShake from "./CameraShake"
import Playlists from "./Playlists"
import PostProcessing from "./PostProcessing"
import SignInTV from "./SignInTV"

// Extend THREE with necessary geometries - this fixes Text3D issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)

// Additional extend for drei components that need it
try {
	// Import and extend TextGeometry if available
	import("three-stdlib")
		.then((threeStdlib) => {

			if (threeStdlib.TextGeometry) {

				extend({ TextGeometry: threeStdlib.TextGeometry })
			}
		})
		.catch(() => {
			// Fallback - drei should handle this automatically
			console.warn("Using drei automatic extend for TextGeometry")
		})
} catch (_e) {
	// Silent fallback
}

interface SceneProps {
	onProgressChange?: (data: {
		loaded: number
		progress: number
		total: number
	}) => void
	onSceneReady?: () => void
}

export default function Scene({ onProgressChange, onSceneReady }: SceneProps) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	// Don't render until mounted on client to avoid hydration issues
	if (!mounted) { return null }

	const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

	const canvasProps = {
		camera: {
			far: 100,
			fov: 75,
			near: 0.01,
			position: new Vector3(0, 0, 5),
			zoom: isMobile ? 0.75 : 1
		},
		dpr: isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio,
		frameloop: "always" as const,
		gl: {
			antialias: !isMobile,
			depth: true,
			powerPreference: "high-performance" as const,
			stencil: false
		}
	}

	return (
		<Canvas
			id="canvas"
			{...canvasProps}
			eventPrefix="client"
			eventSource={document.body}
			flat
			onCreated={() => {
				onSceneReady?.()
			}}
			style={{
				width: "100svw",
				height: "100svh",
				left: 0,
				overflow: "hidden",
				position: "absolute",
				top: 0,
				zIndex: 1
			}}
		>
			<Bvh>
				<ProgressBridge onChange={onProgressChange} />
				<CameraShake />
				{/* <SignInTV position={[0, -1.25, 0]} /> */}
				<InitialScene position={[0, -1.25, 0]} />
				{/* <Playlists /> */}
				<ambientLight intensity={0.5} />
				<directionalLight intensity={1} position={[10, 10, 5]} />
				<AdaptiveDpr />
			</Bvh>
		</Canvas>
	)
}

function ProgressBridge({
	onChange
}: {
	onChange?: (data: { loaded: number; progress: number; total: number }) => void
}) {
	const { loaded, progress, total } = useProgress()
	useEffect(() => {
		onChange?.({ loaded, progress, total })
	}, [progress, loaded, total, onChange])
	return null
}
