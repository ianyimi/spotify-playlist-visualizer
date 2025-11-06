import { authComponent } from "."
import { query } from "../_generated/server"

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return authComponent.getAuthUser(ctx)
	}
})
