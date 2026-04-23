import { scrapePinterestWithPuppeteer } from './src/lib/pinterest-puppeteer.js';

// The failing URL that redirects to an error page
const url = 'https://pin.it/61D8RlS9V';

async function test() {
    console.log(`Testing Pinterest scraper for: ${url}`);

    try {
        const data = await scrapePinterestWithPuppeteer(url);
        console.log('Scrape Result:', JSON.stringify(data, null, 2));

        if (data.imageUrls.length > 0) {
            console.log("SUCCESS: Images found!");
        } else {
            console.log("FAILURE: No images found.");
        }

    } catch (e) {
        console.error('Test failed:', e);
        if (browser) await browser.close();
    }
}

test();
