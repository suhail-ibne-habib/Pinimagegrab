import { scrapePinterestWithPuppeteer } from './src/lib/pinterest-puppeteer.js';

// Test URL (standard pin)
const url = "https://www.pinterest.com/pin/831406781216550748/";

(async () => {
    console.log(`Testing Pinterest scraper for: ${url}`);
    try {
        const data = await scrapePinterestWithPuppeteer(url);
        console.log("Scrape Result:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test Failed:", e);
    }
})();
