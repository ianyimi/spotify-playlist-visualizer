export * from "./auth"

export const COLLECTION_SLUG_USERS = "users" as const;
export const COLLECTION_SLUG_ACCOUNTS = "accounts" as const;
export const COLLECTION_SLUG_SESSIONS = "sessions" as const;
export const COLLECTION_SLUG_VERIFICATIONS = "verifications" as const;

export const COLLECTION_SLUG_SITES = "sites" as const;
export const COLLECTION_SLUG_PAGES = "pages" as const;

export const COLLECTION_SLUG_MEDIA = "media" as const;
export const COLLECTION_SLUG_THEMES = "themes" as const;
export const COLLECTION_SLUG_HEADERS = "headers" as const;
export const COLLECTION_SLUG_FOOTERS = "footers" as const;

export const AUTH_PROVIDERS = {
	apple: "apple",
	atlassian: "atlassian",
	cognito: "cognito",
	discord: "discord",
	dropbox: "dropbox",
	facebook: "facebook",
	figma: "figma",
	github: "github",
	gitlab: "gitlab",
	google: "google",
	huggingface: "huggingface",
	kakao: "kakao",
	kick: "kick",
	line: "line",
	linear: "linear",
	linkedin: "linkedin",
	microsoft: "microsoft",
	naver: "naver",
	notion: "notion",
	paypal: "paypal",
	reddit: "reddit",
	roblox: "roblox",
	salesforce: "salesforce",
	slack: "slack",
	spotify: "spotify",
	tiktok: "tiktok",
	twitch: "twitch",
	twitter: "twitter",
	vk: "vk",
	zoom: "zoom",
} as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS];

