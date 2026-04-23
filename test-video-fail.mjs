import { scrapePinterestWithPuppeteer } from './src/lib/pinterest-puppeteer.js';
import fs from 'fs';
import puppeteer from 'puppeteer';

const url = 'https://pin.it/LD1CZSRAO';

async function test() {
    console.log(`Testing Pinterest Video scraper for: ${url}`);

    // We'll run a manual puppeteer instance to capture HTML/Network in case the library function swallows the error or data
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

        // Network Interception Logging
        page.on('response', async (response) => {
            const type = response.request().resourceType();
            const url = response.url();

            if (type === 'xhr' || type === 'fetch') {
                try {
                    const json = await response.json();
                    // Check for keywords
                    if (JSON.stringify(json).includes('video') ||
                        JSON.stringify(json).includes('.mp4') ||
                        JSON.stringify(json).includes('V_720P')) {
                        console.log(`[Network] Found potential VIDEO data in: ${url}`);
                        fs.writeFileSync(`debug_video_network_${Date.now()}.json`, JSON.stringify(json, null, 2));
                    }
                } catch (e) {
                    // Ignore non-json
                }
            }
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const content = await page.content();
        fs.writeFileSync('debug_video.html', content);
        console.log('Dumped HTML to debug_video.html');

        console.log('Running scraper function...');
        const data = await scrapePinterestWithPuppeteer(url);
        console.log('Scrape Result:', JSON.stringify(data, null, 2));

        if (data.videoUrl) {
            console.log("SUCCESS: Video URL found: ", data.videoUrl);
        } else {
            console.log("FAILURE: No video URL found.");
        }

    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        if (browser) await browser.close();
    }
}

test();
