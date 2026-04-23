import puppeteer from 'puppeteer';

/**
 * Scrapes Instagram post data using Puppeteer to handle dynamic content (carousels).
 * @param {string} url - The Instagram post URL.
 * @returns {Promise<Object>} - The scraped data.
 */
export async function scrapeInstagramWithPuppeteer(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled' // Mask webdriver
            ],
            ignoreDefaultArgs: ['--enable-automation'],
        });

        const page = await browser.newPage();

        // Set a realistic User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        // Block fonts/styles to speed up
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['font', 'stylesheet'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`[Puppeteer] Navigating to ${url}...`);
        // Navigate with a reasonable timeout
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Attempt to handle cookie dialog blindly
        try {
            const cookieSelector = 'button._a9--._a9_0';
            await page.waitForSelector(cookieSelector, { timeout: 2000 }).then(btn => btn.click());
        } catch (e) { }

        // Method to wait for content
        try {
            await page.waitForSelector('article', { timeout: 8000 });
        } catch (e) {
            console.warn("[Puppeteer] Main article not found (possible login wall). Attempting to scrape head tags...");
        }

        // EXTRACT DATA
        const data = await page.evaluate(() => {
            const result = {
                imageUrls: [],
                author: '',
                authorName: '',
                caption: ''
            };

            // 1. Metadata Strategy (Always available)
            const ogImage = document.querySelector('meta[property="og:image"]')?.content;
            const ogDesc = document.querySelector('meta[property="og:description"]')?.content;
            const ogTitle = document.querySelector('meta[property="og:title"]')?.content;

            if (ogImage) result.imageUrls.push(ogImage);

            // Parse Author/Caption from Metadata
            if (ogDesc) {
                // Handle: "X Likes, Y Comments - Name (@handle) on Instagram: ..."
                const handleMatch = ogDesc.match(/@([a-zA-Z0-9_.]+)/);
                if (handleMatch) result.author = handleMatch[1];

                // Alternate: "- handle on"
                const dashMatch = ogDesc.match(/- ([a-zA-Z0-9_.]+) on/);
                if (dashMatch && !result.author) result.author = dashMatch[1];

                // Caption
                const captionParts = ogDesc.split('Instagram: "');
                if (captionParts.length > 1) {
                    result.caption = captionParts[1].replace('"', '');
                } else {
                    const simpleCap = ogDesc.split('Instagram: ');
                    if (simpleCap.length > 1) result.caption = simpleCap[1];
                }
            }

            if (ogTitle) {
                // Title: "Name (@handle) on Instagram..."
                const titleMatch = ogTitle.match(/(.*) \(@([^)]+)\)/);
                if (titleMatch) {
                    result.authorName = titleMatch[1].trim();
                    if (!result.author) result.author = titleMatch[2].trim();
                } else {
                    const simple = ogTitle.match(/(.*) on Instagram/);
                    if (simple) result.authorName = simple[1].trim();
                }
            }

            // 2. DOM Strategy (Carousel)
            const article = document.querySelector('article');
            if (article) {
                const images = new Set();
                if (ogImage) images.add(ogImage);

                const imgs = article.querySelectorAll('img');
                imgs.forEach(img => {
                    const src = img.src;
                    // Filter specifically for Instagram/FB CDN images that are large enough
                    if (src && (src.includes('cdninstagram') || src.includes('fbcdn')) && img.width > 200) {
                        images.add(src);
                    }
                });

                // If DOM found more images (carousel loaded), update result
                if (images.size > result.imageUrls.length) {
                    result.imageUrls = Array.from(images);
                }

                // Better Author/Caption from DOM
                const headerLink = article.querySelector('header h2 a') || article.querySelector('header span a');
                if (headerLink) {
                    result.author = headerLink.innerText;
                    result.authorName = result.author;
                }

                const h1 = article.querySelector('h1');
                if (h1) result.caption = h1.innerText;
            }

            return result;
        });

        console.log(`[Puppeteer] Found ${data.imageUrls.length} images.`);
        return data;

    } catch (error) {
        console.error("[Puppeteer] Error:", error.message);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}
