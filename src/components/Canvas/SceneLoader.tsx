"use client"

import dynamic from "next/dynamic"
import { lazy, Suspense, useEffect, useState } from "react"

import { $sceneStore } from "~/stores/scene"
// Do not use drei hooks outside Canvas
import { cn } from "~/styles/utils"

// Dynamically import the heavy Scene component
const Scene = lazy(() => import("./Scene"))

// Dynamically import LoadingLogo with no SSR to avoid hydration issues
const LoadingLogo = dynamic(() => import("~/components/common/LoadingLogo"), {
	ssr: false
})

export default function SceneLoader() {
	const [showScene, setShowScene] = useState(false)
	const [sceneCreated, setSceneCreated] = useState(false)
	const [progress, setProgress] = useState(0)
	const [_loaded, setLoaded] = useState(0)
	const [total, setTotal] = useState(0)

	// Show scene when Canvas is created AND all 3D assets are loaded
	// useProgress tracks Three.js assets (textures, models) NOT external API calls
	// So waiting for progress === 100 is safe - Spotify API calls won't block this
	// If there are no assets to load (total === 0), show immediately when scene is created
	useEffect(() => {
		if (sceneCreated && !showScene) {
			// If no assets to load (total === 0) OR all assets loaded (progress === 100)
			if (total === 0 || progress === 100) {
				setShowScene(true)
				$sceneStore.sceneReady.set(true)
			}
		}
	}, [sceneCreated, showScene, progress, total])

	return (
		<div className="h-full w-full">
			<DreiLoadingScreen progress={total === 0 ? 100 : progress} visible={!showScene} />

			<div
				className={`fixed inset-0 transition-opacity duration-500 ${showScene ? "opacity-100" : "opacity-0"}`}
				style={{ zIndex: 1 }}
			>
				<Suspense fallback={null}>
					<Scene
						onProgressChange={({ loaded: l, progress: p, total: t }) => {
							setProgress(p)
							setLoaded(l)
							setTotal(t)
						}}
						onSceneReady={() => setSceneCreated(true)}
					/>
				</Suspense>
			</div>
		</div>
	)
}

function DreiLoadingScreen({
	progress,
	visible
}: {
	progress: number
	visible: boolean
}) {
	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-[#010101] transition-opacity duration-500",
				visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
			)}
		>
			<LoadingLogo progress={progress} />
		</div>
	)
}
