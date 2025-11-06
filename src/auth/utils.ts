import { fetchQuery } from "convex/nextjs"

import { api } from "~/convex/_generated/api"

import { getToken } from './server'

export async function getCurrentUser() {
	try {
		const token = await getToken()
		if (!token) { return null }
		return await fetchQuery(api.auth.api.getCurrentUser, {}, { token })
	} catch (err) {
		console.error("Error getting current user: ", err)
		return null
	}
}
