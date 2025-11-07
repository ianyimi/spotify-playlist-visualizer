import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs";
import { fetchQuery } from "convex/nextjs"
import { cookies } from "next/headers";

import { api } from "~/convex/_generated/api"
import { createAuth } from "~/convex/auth";

export async function getCurrentUser() {
	try {
		const token = await getJWT()
		if (!token) { return null }
		return await fetchQuery(api.auth.api.identifyCurrentUser, {}, { token })
	} catch (err) {
		console.error("Error getting current user: ", err)
		return null
	}
};

// Get Convex auth token for use with fetchQuery/fetchMutation
export function getJWT() {
	// @ts-expect-error GenericCtx type is a superset
	return getTokenNextjs(createAuth);
}

export async function getSessionToken() {
	const cookieStore = await cookies()
	const sessionToken = cookieStore.get("better-auth.session_token")?.value.split(".")[0]
	if (!sessionToken) {
		console.error("Error getting session token")
		return null
	}
	return sessionToken
}
