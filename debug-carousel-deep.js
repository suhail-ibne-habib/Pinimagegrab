const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.instagram.com/p/DC6r_5HSoqN/?img_index=1";

async function deepDebug() {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        };

        console.log(`Fetching: ${url}`);
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);

        // 1. Check OG Image (often just cover)
        const ogImage = $('meta[property="og:image"]').attr('content');
        console.log("OG Image:", ogImage);

        // 2. Look for ANY script containing image URLs
        console.log("\nSearching in scripts...");
        $('script').each((i, el) => {
            const content = $(el).html();
            if (content && (content.includes('edge_sidecar_to_children') || content.includes('display_url'))) {
                console.log(`Script ${i} matches potential data!`);
                // Try to extract JSON
                try {
                    // Often inside window._sharedData = {...}
                    if (content.includes('window._sharedData')) {
                        const jsonStr = content.match(/window\._sharedData\s*=\s*({.+});/);
                        if (jsonStr && jsonStr[1]) {
                            const data = JSON.parse(jsonStr[1]);
                            // Traverse to find media
                            console.log("Found _sharedData!");
                            // Logic to drill down would go here
                        }
                    }
                    // Newer strategy: sometimes inside specific graphQL objects or unrelated variables
                    // Let's just regex for display_url in this script
                    const urls = content.match(/"display_url":"([^"]+)"/g);
                    if (urls) {
                        console.log(`Found ${urls.length} display_urls in script ${i}`);
                        urls.forEach(u => console.log(u));
                    }
                } catch (e) {
                    console.log("Error parsing script:", e.message);
                }
            }
        });

        // 3. Look for ld+json
        console.log("\nSearching ld+json...");
        $('script[type="application/ld+json"]').each((i, el) => {
            console.log($(el).html().substring(0, 200) + "...");
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

deepDebug();
