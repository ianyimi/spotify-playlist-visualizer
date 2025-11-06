import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth"

import {
	COLLECTION_SLUG_ACCOUNTS,
	COLLECTION_SLUG_SESSIONS,
	COLLECTION_SLUG_USERS,
	COLLECTION_SLUG_VERIFICATIONS,
	USER_ROLES
} from "~/db/constants"

import type { DataModel } from "../_generated/dataModel"

import { components } from "../_generated/api"
import betterAuthPlugins from "./plugins"


export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (
	ctx: GenericCtx<DataModel>,
	{ optionsOnly } = { optionsOnly: false }
) => {
	return betterAuth({
		socialProviders: {},
		account: {
			modelName: COLLECTION_SLUG_ACCOUNTS
		},
		baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true
		},
		logger: {
			disabled: optionsOnly
		},
		plugins: [
			...betterAuthPlugins,
			convex()
		],
		secret: process.env.BETTER_AUTH_SECRET,
		session: {
			modelName: COLLECTION_SLUG_SESSIONS
		},
		user: {
			additionalFields: {
				role: {
					type: "string",
					defaultValue: USER_ROLES.user,
					input: false,
					required: true
				}
			},
			modelName: COLLECTION_SLUG_USERS
		},
		verification: {
			modelName: COLLECTION_SLUG_VERIFICATIONS
		}
	})
}
