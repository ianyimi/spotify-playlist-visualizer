import type { GenericActionCtx } from "convex/server"

import { betterAuth } from "better-auth"

import {
	TABLE_SLUG_ACCOUNTS,
	TABLE_SLUG_SESSIONS,
	TABLE_SLUG_USERS,
	TABLE_SLUG_VERIFICATIONS,
	USER_ROLES,
} from "~/db/constants"

import type { DataModel } from "../_generated/dataModel"

import schema from "../schema"
import { convexAdapter } from "./adapter"
import betterAuthPlugins from "./plugins"

export const createAuth = (
	ctx: GenericActionCtx<DataModel>,
	{ optionsOnly } = { optionsOnly: false }
) => {
	return betterAuth({
		socialProviders: {
			spotify: {
				clientId: process.env.SPOTIFY_CLIENT_ID!,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				redirectURI: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/callback/spotify`,
				scope: [
					"playlist-read-private",
					"playlist-read-collaborative",
					"user-library-read"
				]
			},
		},
		account: {
			modelName: TABLE_SLUG_ACCOUNTS
		},
		advanced: {
			generateId: false,
		},
		baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
		database: convexAdapter(ctx, schema),
		emailAndPassword: {
			enabled: false
		},
		logger: {
			disabled: optionsOnly
		},
		plugins: betterAuthPlugins,
		secret: process.env.BETTER_AUTH_SECRET,
		session: {
			modelName: TABLE_SLUG_SESSIONS
		},
		trustedOrigins: [process.env.NEXT_PUBLIC_BETTER_AUTH_URL!],
		user: {
			additionalFields: {
				playlistIds: {
					type: "string[]",
					defaultValue: [],
					required: true
				},
				role: {
					type: "string[]",
					defaultValue: [USER_ROLES.user],
					required: true
				}
			},
			modelName: TABLE_SLUG_USERS
		},
		verification: {
			modelName: TABLE_SLUG_VERIFICATIONS
		}
	})
}
