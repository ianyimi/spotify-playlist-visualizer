import { nextCookies } from "better-auth/next-js"
import { apiKey } from "better-auth/plugins"

const plugins = [
	apiKey(),
	nextCookies(),
]

export default plugins
