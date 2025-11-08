import type { TABLE_SLUG_USERS } from "~/db/constants";

import type { Id } from "./_generated/dataModel";

export type UserID = Id<typeof TABLE_SLUG_USERS>
