const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.instagram.com/p/DMfD38JRY-X/";

async function testScrape() {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        console.log(`Fetching: ${url}`);
        const response = await axios.get(url, { headers });

        if (response.request.res.responseUrl && response.request.res.responseUrl.includes('login')) {
            console.log("Redirected to login page!");
        }

        const html = response.data;
        const $ = cheerio.load(html);

        const imageUrl = $('meta[property="og:image"]').attr('content');
        const title = $('meta[property="og:title"]').attr('content');

        console.log("Title:", title);
        console.log("Image URL:", imageUrl);

        if (!imageUrl) {
            console.log("Failed to find og:image");
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
        }
    }
}

testScrape();
