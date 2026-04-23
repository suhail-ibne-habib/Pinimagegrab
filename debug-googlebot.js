const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.instagram.com/p/DMfD38JRY-X/";

async function testGoogleBot() {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        };

        console.log(`Fetching with Googlebot: ${url}`);
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);

        const imageUrl = $('meta[property="og:image"]').attr('content');
        const title = $('title').text();

        console.log("Page Title:", title);
        console.log("Image URL:", imageUrl);

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.log("Status:", error.response.status);
        }
    }
}

testGoogleBot();
