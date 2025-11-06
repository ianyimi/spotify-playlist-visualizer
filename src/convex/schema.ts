import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values"

import { COLLECTION_SLUG_ACCOUNTS, COLLECTION_SLUG_SESSIONS, COLLECTION_SLUG_USERS, COLLECTION_SLUG_VERIFICATIONS } from "~/db/constants";

export default defineSchema({
	[COLLECTION_SLUG_ACCOUNTS]: defineTable({
		idToken: v.optional(v.string()),
		providerId: v.string(),
		accessToken: v.optional(v.string()),
		accessTokenExpiresAt: v.optional(v.number()),
		accountId: v.string(),
		createdAt: v.number(),
		password: v.optional(v.string()),
		refreshToken: v.optional(v.string()),
		refreshTokenExpiresAt: v.optional(v.number()),
		scope: v.optional(v.string()),
		updatedAt: v.number(),
		userId: v.id(COLLECTION_SLUG_USERS),
	})
		.index("by_userId", ["userId"]),

	[COLLECTION_SLUG_SESSIONS]: defineTable({
		createdAt: v.number(),
		expiresAt: v.number(),
		ipAddress: v.optional(v.string()),
		token: v.string(),
		updatedAt: v.number(),
		userAgent: v.optional(v.string()),
		userId: v.id(COLLECTION_SLUG_USERS)
	})
		.index("by_userId", ["userId"]),

	[COLLECTION_SLUG_USERS]: defineTable({
		name: v.string(),
		createdAt: v.number(),
		email: v.string(),
		emailVerified: v.boolean(),
		image: v.optional(v.string()),
		updatedAt: v.number()
	}),

	[COLLECTION_SLUG_VERIFICATIONS]: defineTable({
		identifier: v.string(),
		createdAt: v.number(),
		expiresAt: v.number(),
		updatedAt: v.number(),
		value: v.string(),
	})
})
