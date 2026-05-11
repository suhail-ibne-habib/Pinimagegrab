import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes Instagram post data using a lightweight Axios approach.
 * This avoids resource limits on shared hosting.
 * @param {string} url - The Instagram post URL.
 * @returns {Promise<Object>} - The scraped data.
 */
export async function scrapeInstagramWithPuppeteer(url) {
    try {
        console.log(`[Instagram Scraper] Fetching ${url} with Axios...`);

        // Use a mobile User-Agent to get a simpler HTML structure
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 15000
        });

        const html = response.data;
        const $ = cheerio.load(html);
        
        const result = {
            imageUrls: [],
            author: '',
            authorName: '',
            caption: ''
        };

        // 1. Extract from Metadata (OG Tags)
        const ogImage = $('meta[property="og:image"]').attr('content');
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDesc = $('meta[property="og:description"]').attr('content');

        if (ogImage) result.imageUrls.push(ogImage);

        if (ogTitle) {
            const titleMatch = ogTitle.match(/(.*) \(@([^)]+)\)/);
            if (titleMatch) {
                result.authorName = titleMatch[1].trim();
                result.author = titleMatch[2].trim();
            } else {
                result.authorName = ogTitle.split(' on Instagram')[0];
            }
        }

        if (ogDesc) {
            const captionParts = ogDesc.split('Instagram: "');
            if (captionParts.length > 1) {
                result.caption = captionParts[1].replace('"', '');
            } else {
                result.caption = ogDesc;
            }
        }

        // 2. Fallback: Regex for JSON data (if available in __additionalData or similar)
        if (result.imageUrls.length === 0) {
            const imgMatch = html.match(/"display_url":"([^"]+)"/);
            if (imgMatch) {
                result.imageUrls.push(imgMatch[1].replace(/\\u0026/g, '&'));
            }
        }

        console.log(`[Instagram Scraper] Found ${result.imageUrls.length} images.`);
        return result;

    } catch (error) {
        console.error("[Instagram Scraper] Error:", error.message);
        
        // Return a basic object even on error to avoid crashing
        return {
            imageUrls: [],
            author: '',
            authorName: '',
            caption: '',
            error: "Instagram is currently blocking requests. This is common on shared hosting."
        };
    }
}
