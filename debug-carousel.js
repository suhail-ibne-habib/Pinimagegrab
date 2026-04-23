const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.instagram.com/p/DMfD38JRY-X/";

async function testCarousel() {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        };

        console.log(`Fetching: ${url}`);
        const response = await axios.get(url, { headers });
        const html = response.data;

        // Look for shared data script
        // Usually inside window._sharedData or strict JSON in script tags
        // But Googlebot often gets a simpler version.

        // Let's check for og:image first (usually first image)
        const $ = cheerio.load(html);
        const ogImage = $('meta[property="og:image"]').attr('content');
        console.log("OG Image (Index 1):", ogImage);

        // Try to find other images in the HTML
        // Googlebot version might have them in a list or script
        const images = [];
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.includes('cdninstagram')) {
                images.push(src);
            }
        });

        console.log("Found images in img tags:", images.length);
        images.forEach((img, i) => console.log(`[${i}] ${img}`));

        // Sometimes extracting from script is better
        // Look for embedded JSON
        const scriptContent = $('script').map((i, el) => $(el).html()).get().join(' ');
        // Simple regex to find jpgs could be noisy, but let's try to match edge_sidecar_to_children pattern if possible
        // or just look for all display_url

    } catch (error) {
        console.error("Error:", error.message);
    }
}

testCarousel();
