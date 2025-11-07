/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_adapter_index from "../auth/adapter/index.js";
import type * as auth_adapter_utils from "../auth/adapter/utils.js";
import type * as auth_api from "../auth/api.js";
import type * as auth_config from "../auth/config.js";
import type * as auth_db from "../auth/db.js";
import type * as auth_index from "../auth/index.js";
import type * as auth_plugins_index from "../auth/plugins/index.js";
import type * as auth_sessions from "../auth/sessions.js";
import type * as http from "../http.js";
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
  "auth/adapter/index": typeof auth_adapter_index;
  "auth/adapter/utils": typeof auth_adapter_utils;
  "auth/api": typeof auth_api;
  "auth/config": typeof auth_config;
  "auth/db": typeof auth_db;
  "auth/index": typeof auth_index;
  "auth/plugins/index": typeof auth_plugins_index;
  "auth/sessions": typeof auth_sessions;
  http: typeof http;
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
