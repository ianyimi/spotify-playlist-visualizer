import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth"
import { createAuthMiddleware } from "better-auth/api"

import {
	COLLECTION_SLUG_ACCOUNTS,
	COLLECTION_SLUG_SESSIONS,
	COLLECTION_SLUG_USER_ROLES,
	COLLECTION_SLUG_USERS,
	COLLECTION_SLUG_VERIFICATIONS,
	USER_ROLES
} from "~/db/constants"

import type { DataModel, Doc } from "../_generated/dataModel"

import { components } from "../_generated/api"
import betterAuthPlugins from "./plugins"


export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (
	ctx: GenericCtx<DataModel>,
	{ optionsOnly } = { optionsOnly: false }
) => {
	return betterAuth({
		socialProviders: {
			spotify: {
				clientId: process.env.SPOTIFY_CLIENT_ID!,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				redirectURI: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/callback/spotify`
			},
		},
		account: {
			modelName: COLLECTION_SLUG_ACCOUNTS
		},
		baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: false
		},
		logger: {
			disabled: optionsOnly
		},
		plugins: [
			...betterAuthPlugins,
			convex(),
		],
		secret: process.env.BETTER_AUTH_SECRET,
		session: {
			modelName: COLLECTION_SLUG_SESSIONS
		},
		trustedOrigins: ["http://localhost:3001", "http://127.0.0.1:3001"],
		user: {
			modelName: COLLECTION_SLUG_USERS
		},
		verification: {
			modelName: COLLECTION_SLUG_VERIFICATIONS
		}
	})
}
