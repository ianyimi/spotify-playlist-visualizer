
import type { Id } from "~/convex/_generated/dataModel";
import type { ActionCtx } from "~/convex/_generated/server";

import { internal } from "~/convex/_generated/api";
import { type TABLE_SLUG_USERS } from "~/db/constants";
import { err } from "~/server/dal";

type AccessTokenResponse = {
	access_token: string,
	expires_in: number,
	refresh_token: string,
	scope: string
	token_type: string,
}

export async function getAccessToken({
	ctx,
	userId
}: {
	ctx: ActionCtx,
	userId: Id<typeof TABLE_SLUG_USERS>,
}) {
	const account = await ctx.runQuery(internal.users.getUserAccount, { id: userId })
	if (!account.accessToken || !account.accessTokenExpiresAt || !account.refreshToken) {
		throw new Error("user account missing access or refresh token")
	}
	if (account.accessTokenExpiresAt > Date.now()) {
		return account.accessToken
	}

	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	const response = await fetch("https://accounts.spotify.com/api/token", {
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: account.refreshToken
		}),
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			"Authorization": `Basic ${btoa(clientId + ":" + clientSecret)}`
		},
		method: "POST"
	})
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to fetch new access token: ${response.status} ${response.statusText} - ${errorText}`)
	}
	const data = await response.json() as AccessTokenResponse

	await ctx.runMutation(internal.account.patchAccessToken, {
		id: account._id,
		accessToken: data.access_token,
		accessTokenExpiresAt: Date.now() + data.expires_in,
		refreshToken: data.refresh_token
	})

	return data.access_token
}

export async function spotifyFetch<T>({
	accessToken,
	endpoint,
	url
}: {
	accessToken: string,
	endpoint: string,
	url?: never
} | {
	accessToken: string,
	endpoint?: never,
	url: string
}): Promise<T> {
	const response = await fetch(url ?? `https://api.spotify.com/v1/${endpoint}`, {
		headers: {
			"Authorization": `Bearer ${accessToken}`
		}
	})
	if (!response.ok) {
		throw new Error(`Error fetching ${url ? "url" : "endpoint"} ${url ?? endpoint}: ${response.statusText}`)
	}
	return (await response.json()) as T
}
