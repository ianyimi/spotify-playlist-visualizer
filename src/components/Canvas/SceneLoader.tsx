"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { lazy, Suspense, useState } from "react"

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
	const [progress, setProgress] = useState(0)
	const pathname = usePathname()

	if (["/auth/sign-in", "/auth/sign-up"].includes(pathname)) {
		return null
	}

	return (
		<div className="h-full w-full">
			<DreiLoadingScreen progress={progress} visible={!showScene} />

			<div
				className={`fixed inset-0 transition-opacity duration-500 ${showScene ? "opacity-100" : "opacity-0"}`}
				style={{ zIndex: 1 }}
			>
				<Suspense fallback={null}>
					<Scene
						onProgressChange={({ progress: p }) => {
							setProgress(p)
							if (progress === 100) {
								setTimeout(() => {
									setShowScene(true)
									$sceneStore.sceneReady.set(true)
								}, 500)
							}
						}}
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
