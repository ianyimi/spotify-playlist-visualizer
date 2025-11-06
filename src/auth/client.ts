import { convexClient } from "@convex-dev/better-auth/client/plugins"
import {
	apiKeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from 'better-auth/react'

import { env } from '~/env.mjs';

export const authClient = createAuthClient({
	basePath: "/api/auth",
	baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
	plugins: [
		convexClient(),
		apiKeyClient(),
	]
})

export const { signIn, signOut, useSession } = authClient

// copied from code example, unsure if this is actually useful or not
// eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-empty-function
authClient.$store.listen('$sessionSignal', async () => { })
