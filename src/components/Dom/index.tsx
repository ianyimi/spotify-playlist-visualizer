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
			id="domContent"
			className="relative w-screen h-screen overflow-y-scroll"
			style={{
				zIndex: 10,
				pointerEvents: "auto"
			}}
		>
			<div
				id="wrapper"
				className={`overflow-x-hidden min-w-full min-h-full transition-opacity duration-500 ${
					sceneReady ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				<div id="content" className="relative min-h-screen">
					{children}
				</div>
			</div>
		</div>
	)
})
