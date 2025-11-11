// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		const isProd = input.stage === "production";
		return {
			name: "spotify-playlist-visualizer",
			removal: isProd ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: {
				aws: {
					region: "us-west-1",
					profile: process.env.GITHUB_ACTIONS
						? undefined
						: isProd
							? "playlistvis-production"
							: "playlistvis-dev",
				},
			},
		};
	},
	async run() {
		// Only import env in production to avoid NODE_ENV validation issues in dev
		const isProd = $app.stage === "production";

		// Skip env validation during SST builds
		process.env.SKIP_ENV_VALIDATION = "1";

		const rootDomain = "playlistviz.com";
		const domain = isProd ? rootDomain : `${$app.stage}.${rootDomain}`;

		const NEXT_PUBLIC_CONVEX_URL = new sst.Secret("NEXT_PUBLIC_CONVEX_URL");
		const NEXT_PUBLIC_CONVEX_SITE_URL = new sst.Secret("NEXT_PUBLIC_CONVEX_SITE_URL");
		const NEXT_PUBLIC_BETTER_AUTH_URL = new sst.Secret(
			"NEXT_PUBLIC_BETTER_AUTH_URL",
		);
		const DOMAIN_CERT_ARN = new sst.Secret("DOMAIN_CERT_ARN");
		const BETTER_AUTH_SECRET = new sst.Secret("BETTER_AUTH_SECRET");
		const SPOTIFY_CLIENT_ID = new sst.Secret("SPOTIFY_CLIENT_ID");
		const SPOTIFY_CLIENT_SECRET = new sst.Secret("SPOTIFY_CLIENT_SECRET");

		const router = new sst.aws.Router("PlaylistVisRouter", {
			domain: {
				name: domain,
				redirects: isProd ? [`www.${domain}`] : [],
				dns: false,
				cert: DOMAIN_CERT_ARN.value,
			},
		});

		new sst.aws.Nextjs("Frontend", {
			link: [
				NEXT_PUBLIC_BETTER_AUTH_URL,
				BETTER_AUTH_SECRET,
				NEXT_PUBLIC_CONVEX_URL,
				NEXT_PUBLIC_CONVEX_SITE_URL,
				SPOTIFY_CLIENT_ID,
				SPOTIFY_CLIENT_SECRET
			],
			router: {
				instance: router,
			},
			server: {
				install: ["sharp"],
				runtime: "nodejs22.x",
				timeout: "60 seconds",
			},
			warm: isProd ? 1 : 0,
			permissions: [
				{
					actions: ["cloudfront:ListConnectionFunctions"],
					resources: ["*"],
				},
				{
					actions: ["lambda:GetLayerVersion"],
					resources: ["*"],
				}
			],
			environment: {
				// NODE_ENV: process.env.NODE_ENV,
				// NEXT_PUBLIC_BETTER_AUTH_URL: NEXT_PUBLIC_BETTER_AUTH_URL.value,
				// BETTER_AUTH_SECRET: BETTER_AUTH_SECRET.value,

				// Build time for deployment verification
				BUILD_TIME: new Date().toISOString(),
			},
		});
	},
});
