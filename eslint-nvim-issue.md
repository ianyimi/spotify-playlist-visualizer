# ESLint Perfectionist Not Working in Neovim

## Problem Summary

ESLint with `eslint-plugin-perfectionist` is correctly configured and works from the CLI, but Neovim is not showing any ESLint errors/warnings for perfectionist rules (object sorting, import sorting, etc.). The same config works fine in the uifoundry project.

## Current Setup

**Project:** t3-x-payloadcms
**ESLint Version:** 9.31.0
**Config File:** `eslint.config.js` (flat config format)

### Installed Plugins
- `eslint-plugin-perfectionist@^4.15.1`
- `eslint-plugin-import-x@^4.16.1`
- `typescript-eslint@^8.27.0`

### ESLint Config (eslint.config.js)
```javascript
import perfectionist from "eslint-plugin-perfectionist"
import importX from "eslint-plugin-import-x"

export default tseslint.config(
  // ...
  perfectionist.configs["recommended-natural"],
  {
    plugins: {
      "import-x": importX
    },
    rules: {
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
      // ... other rules
    }
  }
)
```

## Test Results

### CLI Testing (✅ Works)
```bash
pnpm exec eslint src/app/_components/post.tsx
```

**Output:**
```
/Users/zaye/Documents/Projects/t3-x-payloadcms/src/app/_components/post.tsx
  31:9   error  Expected "className" to come before "onSubmit"  perfectionist/sort-jsx-props
  35:11  error  Expected "placeholder" to come before "type"    perfectionist/sort-jsx-props
  37:11  error  Expected "onChange" to come before "value"      perfectionist/sort-jsx-props
  38:11  error  Expected "className" to come before "onChange"  perfectionist/sort-jsx-props
  42:11  error  Expected "className" to come before "type"      perfectionist/sort-jsx-props

✖ 5 problems (5 errors, 0 warnings)
```

### Debug Output Confirms
- Using flat config: `true`
- Config file loaded: `/Users/zaye/Documents/Projects/t3-x-payloadcms/eslint.config.js`
- Perfectionist plugin loaded successfully
- All perfectionist rules are active (sort-objects, sort-imports, sort-jsx-props, etc.)

### Neovim (❌ Doesn't Work)
- No ESLint errors shown in the editor
- Tried reloading LSP
- Tried restarting Neovim
- Still no errors displayed

## Root Cause

The ESLint configuration is **100% correct**. The issue is that the **Neovim ESLint LSP is not recognizing the flat config format** (eslint.config.js).

The ESLint LSP in Neovim likely defaults to looking for legacy `.eslintrc.*` files and needs to be explicitly configured to use flat config.

## Required Fix

The Neovim ESLint LSP configuration needs to be updated to enable flat config support. This typically involves:

### For nvim-lspconfig with eslint language server:
```lua
require('lspconfig').eslint.setup({
  settings = {
    useFlatConfig = true,  -- Enable flat config support
  }
})
```

### For other setups:
- **none-ls/null-ls**: May need to update the source or LSP server
- **nvim-lint**: Check if the eslint linter has flat config option
- **conform.nvim**: Verify formatter configuration

## Comparison with Working Project

The uifoundry project has the **exact same ESLint config** and it works in Neovim. This suggests:
1. Either the uifoundry project has different Neovim LSP settings
2. Or the LSP was configured differently when initially opened

## Next Steps for Nvim Agent

1. Check the current ESLint LSP configuration in Neovim
2. Identify which ESLint integration is being used (lspconfig, none-ls, nvim-lint, etc.)
3. Update the configuration to enable flat config support (`useFlatConfig = true`)
4. Restart the LSP server after configuration changes
5. Verify that ESLint errors appear in the editor

## Additional Context

- No legacy `.eslintrc.*` files exist in the project
- The project uses TypeScript with `tsconfig.json` at the root
- ESLint is configured to use type-aware linting with `parserOptions.project: "./tsconfig.json"`
- The flat config is the new standard in ESLint 9+ and should be preferred
