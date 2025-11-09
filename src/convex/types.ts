import type { TABLE_SLUG_PLAYLISTS, TABLE_SLUG_USERS } from "~/db/constants";

import type { Doc, Id } from "./_generated/dataModel";

export type Playlist = Doc<typeof TABLE_SLUG_PLAYLISTS>

export type UserID = Id<typeof TABLE_SLUG_USERS>
