import { FlatCompat } from "@eslint/eslintrc";
import convexPlugin from "@convex-dev/eslint-plugin"
import tseslint from 'typescript-eslint';
import perfectionist from "eslint-plugin-perfectionist"
import importX from "eslint-plugin-import-x"

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
});

const convexConfig = convexPlugin.configs.recommended[0];
const convexRules = convexConfig.rules;

export const defaultESLintIgnores = [
	"**/.temp",
	"**/.git",
	"**/.hg",
	"**/.pnp.*",
	"**/.svn",
	"**/.next",
	"**/.open-next",
	"**/.sst",
	"**/playwright.config.ts",
	"**/vitest.config.ts",
	"**/tsconfig.tsbuildinfo",
	"**/README.md",
	"**/eslint.config.js",
	"**/dist/",
	"**/.yarn/",
	"**/build/",
	"**/node_modules/",
	"**/temp/",
	"**/registry/",
	"**/public/",
	"**/convex/_generated/",
	"**/.source/",
	"**/sst.config.ts",
	"**/sst.workflow.ts",
];

export default tseslint.config(
	{
		ignores: defaultESLintIgnores
	},
	...compat.extends("next/core-web-vitals"),
	perfectionist.configs["recommended-natural"],
	{
		files: ['**/*.ts', '**/*.tsx'],
		extends: [
			...tseslint.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked
		],
		plugins: {
			"import-x": importX
		},
		rules: {
			"@typescript-eslint/array-type": "off",
			"@typescript-eslint/ban-tslint-comment": "off",
			"@typescript-eslint/unbound-method": "off",
			"@typescript-eslint/consistent-type-definitions": "off",
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{ prefer: "type-imports", fixStyle: "inline-type-imports" },
			],
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^(_|ignore)",
				},
			],
			"@typescript-eslint/require-await": "off",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{ checksVoidReturn: { attributes: false } },
			],

			curly: ["warn", "all"],
			"no-console": "off",
			"no-underscore-dangle": "off",
			"object-shorthand": "warn",
			"no-useless-escape": "warn",
			"import-x/no-duplicates": "warn",
			"import-x/prefer-default-export": "off",

			// Allow default exports for Next.js
			"no-restricted-exports": "off",

			// Perfectionist sorting configuration (from PayloadCMS)
			"perfectionist/sort-objects": [
				"error",
				{
					type: "natural",
					order: "asc",
					partitionByComment: true,
					partitionByNewLine: true,
					groups: ["top", "unknown"],
					customGroups: {
						top: ["_id", "id", "name", "slug", "type"],
					},
				},
			],
		},
	},
	{
		// Disable rules for test files and config files
		files: [
			"src/test/**/*.js",
			"src/test/**/*.ts",
			"tests/**/*.ts",
			"*.config.js",
			"*.config.mjs",
		],
		rules: {
			"import/no-anonymous-default-export": "off",
		},
	},
	{
		files: ["**/src/convex/**/*.ts"],
		plugins: {
			"@convex-dev": convexPlugin,
		},
		rules: convexRules
	},
	{
		linterOptions: {
			reportUnusedDisableDirectives: "error"
		},
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				sourceType: "module",
				ecmaVersion: "latest",
				tsconfigRootDir: import.meta.dirname,
			},
		}
	},
)
