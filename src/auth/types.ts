import type { Session as BetterAuthSession, User as BetterAuthUser } from "better-auth"

import type { UserRole } from "~/db/constants"

export type Session = BetterAuthSession & {
	user: User
}

export type User = BetterAuthUser & {
	role: UserRole
}
