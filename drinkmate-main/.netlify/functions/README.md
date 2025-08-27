# Netlify Functions

This directory contains Netlify Functions for the DrinkMate application.

## @netlify/blobs Usage

Due to CommonJS/ES Module compatibility issues with @netlify/blobs v10.x, we are using v9.1.6 which resolves these issues.

### Option 1: Use ES Modules (.mjs files)
- File extension: `.mjs`
- Use standard import syntax:
```javascript
import { getStore } from '@netlify/blobs';
```

### Option 2: Use Dynamic Import (.js files)
- File extension: `.js`
- Use dynamic import to avoid CommonJS conflicts:
```javascript
const { getStore } = await import('@netlify/blobs');
```

## Configuration

The project is configured with:
- Node.js version: 18
- Bundler: esbuild (supports ES modules)
- Functions directory: `.netlify/functions`
- @netlify/blobs version: 9.1.6 (compatible version)

## Example Functions

- `blob-test.mjs` - Example using ES modules
- `blob-test-dynamic.js` - Example using dynamic import

## Testing

You can test the blob functionality by calling:
- `/.netlify/functions/blob-test` (ES modules version)
- `/.netlify/functions/blob-test-dynamic` (dynamic import version)

## Troubleshooting

If you encounter errors:
1. Ensure you're using Node.js 14+
2. Use either .mjs extension with standard imports OR .js with dynamic imports
3. Check that esbuild is set as the node_bundler in netlify.toml
4. If using @netlify/blobs, use version 9.1.6 or earlier to avoid CommonJS/ES Module conflicts
5. Update packages: `npm update @netlify/blobs @netlify/runtime-utils`
