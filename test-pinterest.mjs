import { scrapePinterestWithPuppeteer } from './src/lib/pinterest-puppeteer.js';

// Test URL (standard pin)
const url = "https://pin.it/7y5Z0rUeE";

(async () => {
    console.log(`Testing Pinterest scraper for: ${url}`);
    try {
        const data = await scrapePinterestWithPuppeteer(url);
        console.log("Scrape Result:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test Failed:", e);
    }
})();
