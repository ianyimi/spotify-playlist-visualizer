/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const nextConfig = {
	allowedDevOrigins: ["127.0.0.1", "localhost"],
	reactCompiler: true,
	turbopack: {
		rules: {
			"*.{glsl,vert,frag}": {
				as: "*.js",
				loaders: ["raw-loader"],
			}
		}
	}
};

export default nextConfig
