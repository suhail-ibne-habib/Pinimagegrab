const { scrapeInstagramWithPuppeteer } = require('./src/lib/instagram-puppeteer.js');

// Helper to run ES module function in this script context if needed,
// strictly speaking we should use .mjs or ensure package.json is "type": "module" which it is likely not.
// Adjusting to CommonJS for the test script wrapper if needed or just use import if environment supports.
// Since project is Next.js (ESM), we might need to use `import()` in a .mjs file.

// Let's create `test-puppeteer.mjs` instead to be safe.
