import { scrapePinterestWithPuppeteer } from './src/lib/pinterest-puppeteer.js';

// The problematic video URL
const url = "https://pin.it/LD1CZSRAO";

(async () => {
    console.log(`[Verify] Testing Pinterest scraper for: ${url}`);
    try {
        const start = Date.now();
        const data = await scrapePinterestWithPuppeteer(url);
        const end = Date.now();

        console.log(`[Verify] Scrape took ${(end - start) / 1000}s`);

        if (data.videoUrl) {
            console.log("[Verify] SUCCESS! Video URL found:", data.videoUrl);
            console.log("Full Result:", JSON.stringify(data, null, 2));
        } else {
            console.error("[Verify] FAILURE! Video URL NOT found.");
            console.log("Partial Result:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("[Verify] Test Exception:", e);
    }
})();
