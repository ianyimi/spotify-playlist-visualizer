"use client"

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"
import { type ReactNode } from "react";

import { authClient } from "~/auth/client"
import { env } from "~/env.mjs";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL, {
	expectAuth: true
})

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
	return (
		<ConvexBetterAuthProvider authClient={authClient} client={convex}>
			{children}
		</ConvexBetterAuthProvider>
	)
}
