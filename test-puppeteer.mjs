import { scrapeInstagramWithPuppeteer } from './src/lib/instagram-puppeteer.js';

// Test URL with carousel
const url = "https://www.instagram.com/p/DC6r_5HSoqN/";

(async () => {
    console.log(`Testing scraper for: ${url}`);
    try {
        const data = await scrapeInstagramWithPuppeteer(url);
        console.log("Scrape Result:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test Failed:", e);
    }
})();
