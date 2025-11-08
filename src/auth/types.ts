import type { getSession } from "./server";

export type ServerAuthContext = Awaited<ReturnType<typeof getSession>>
