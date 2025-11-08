import { fetchQuery } from "convex/nextjs";

import { api } from "~/convex/_generated/api";

import { getSessionToken } from "./utils";

/**
 * Get current user session in Next.js server components/actions
 * Validates the Better Auth session token from cookies and fetches user data
 */
export const getCurrentUser = async () => {
	try {
		const sessionToken = await getSessionToken()

		if (!sessionToken) {
			return null;
		}

		const session = await fetchQuery(api.auth.sessions.getSessionWithUser, {
			sessionToken,
		});
		if (!session?.user) { return null }
		return session.user;
	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
};

/**
 * Get full session (user + session data) in Next.js server components/actions
 */
export async function getSession() {
	try {
		const sessionToken = await getSessionToken()

		if (!sessionToken) {
			console.log('no session token')
			return null;
		}

		const session = await fetchQuery(api.auth.sessions.getSessionWithUser, {
			sessionToken,
		});
		if (!session?.user) {
			console.log('no session')
			return null
		}
		return session
	} catch (error) {
		console.error("Error getting session:", error);
		return null;
	}
};
