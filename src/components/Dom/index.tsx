"use client"

import { observer, use$ } from "@legendapp/state/react"
import { type ReactNode } from "react"

import { $sceneStore } from "~/stores/scene"

interface DomProps {
	children: ReactNode
}

export default observer(function Dom({ children }: DomProps) {
	const sceneReady = use$($sceneStore.sceneReady)

	return (
		<div
			className="relative w-screen h-screen overflow-y-scroll"
			id="domContent"
			style={{
				pointerEvents: "auto",
				zIndex: 10
			}}
		>
			<div
				className={`overflow-x-hidden min-w-full min-h-full transition-opacity duration-500 ${
					sceneReady ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
				id="wrapper"
			>
				<div className="relative min-h-screen" id="content">
					{children}
				</div>
			</div>
		</div>
	)
})
