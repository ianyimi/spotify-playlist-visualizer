import { convex } from "@convex-dev/better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { apiKey } from "better-auth/plugins"

const plugins = [
	apiKey(),
	nextCookies(),
	convex()
]

export default plugins
