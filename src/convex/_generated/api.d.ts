/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as auth_adapter_index from "../auth/adapter/index.js";
import type * as auth_adapter_utils from "../auth/adapter/utils.js";
import type * as auth_api from "../auth/api.js";
import type * as auth_config from "../auth/config.js";
import type * as auth_db from "../auth/db.js";
import type * as auth_index from "../auth/index.js";
import type * as auth_plugins_index from "../auth/plugins/index.js";
import type * as auth_sessions from "../auth/sessions.js";
import type * as http from "../http.js";
import type * as model_spotify_index from "../model/spotify/index.js";
import type * as model_spotify_utils from "../model/spotify/utils.js";
import type * as model_users from "../model/users.js";
import type * as spotify from "../spotify.js";
import type * as types from "../types.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  account: typeof account;
  "auth/adapter/index": typeof auth_adapter_index;
  "auth/adapter/utils": typeof auth_adapter_utils;
  "auth/api": typeof auth_api;
  "auth/config": typeof auth_config;
  "auth/db": typeof auth_db;
  "auth/index": typeof auth_index;
  "auth/plugins/index": typeof auth_plugins_index;
  "auth/sessions": typeof auth_sessions;
  http: typeof http;
  "model/spotify/index": typeof model_spotify_index;
  "model/spotify/utils": typeof model_spotify_utils;
  "model/users": typeof model_users;
  spotify: typeof spotify;
  types: typeof types;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
