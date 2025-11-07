import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values"

import { COLLECTION_SLUG_ACCOUNTS, COLLECTION_SLUG_SESSIONS, COLLECTION_SLUG_USER_ROLES, COLLECTION_SLUG_USERS, COLLECTION_SLUG_VERIFICATIONS } from "~/db/constants";

export default defineSchema({
	// Better Auth component tables (type definitions only - actual tables are in component)
	[COLLECTION_SLUG_USERS]: defineTable({
		displayUsername: v.optional(v.union(v.null(), v.string())),
		name: v.string(),
		username: v.optional(v.union(v.null(), v.string())),
		createdAt: v.number(),
		email: v.string(),
		emailVerified: v.boolean(),
		image: v.optional(v.string()),
		isAnonymous: v.optional(v.union(v.null(), v.boolean())),
		phoneNumber: v.optional(v.union(v.null(), v.string())),
		phoneNumberVerified: v.optional(v.union(v.null(), v.boolean())),
		twoFactorEnabled: v.optional(v.union(v.null(), v.boolean())),
		updatedAt: v.number(),
		userId: v.optional(v.union(v.null(), v.string())),
	})
		.index("by_email", ["email"]),

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
		userId: v.string(),
	}),

	[COLLECTION_SLUG_SESSIONS]: defineTable({
		createdAt: v.number(),
		expiresAt: v.number(),
		ipAddress: v.optional(v.string()),
		token: v.string(),
		updatedAt: v.number(),
		userAgent: v.optional(v.string()),
		userId: v.string(),
	}),

	[COLLECTION_SLUG_VERIFICATIONS]: defineTable({
		identifier: v.string(),
		createdAt: v.number(),
		expiresAt: v.number(),
		updatedAt: v.number(),
		value: v.string(),
	}),

	// Your custom app table
	[COLLECTION_SLUG_USER_ROLES]: defineTable({
		roles: v.array(v.string()),
		userId: v.string(), // Note: this references the component's user.id (string), not v.id()
	})
		.index("by_userId", ["userId"])
})
