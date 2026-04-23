const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.instagram.com/p/DC6r_5HSoqN/";

async function testMetadata() {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        };

        console.log(`Fetching: ${url}`);
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content');

        console.log("\n--- Metadata ---");
        console.log("Title Raw:", title);
        console.log("Desc Raw: ", description);

        // Test Regex
        const authorMatch = title.match(/(.*) \(@([^)]+)\)/);
        if (authorMatch) {
            console.log(`[Regex A] matched: Name="${authorMatch[1]}", User="${authorMatch[2]}"`);
        } else {
            console.log("[Regex A] Failed on title.");
        }

        // Look for JSON blob that might contain carousel
        console.log("\n--- Image Search ---");
        const jsonScripts = [];
        $('script').each((i, el) => {
            const text = $(el).html();
            if (text && (text.includes('edge_sidecar_to_children') || text.includes('display_url'))) {
                // Try to extract strict JSON
                // console.log(`Script ${i} has potential.`); 
            }
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

testMetadata();
