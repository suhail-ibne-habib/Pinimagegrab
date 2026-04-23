const axios = require('axios');
const cheerio = require('cheerio');

const shortcode = "DC6r_5HSoqN"; // from https://www.instagram.com/p/DC6r_5HSoqN/
const url = `https://imginn.com/p/${shortcode}/`;

async function testImginn() {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        console.log(`Fetching: ${url}`);
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);

        // Check for author
        const author = $('.user-info .username').text().trim();
        const authorName = $('.user-info .name').text().trim(); // might be empty
        console.log(`Author: ${author}, Name: ${authorName}`);

        // Check for images (Carousel)
        const images = [];
        $('.downloads .download-item').each((i, el) => {
            // usually <a href="...">Download</a> or valid img tag
            const link = $(el).attr('href');
            if (link) images.push(link);
        });

        // Sometimes imginn structure is different
        // Look for <img class="img-fluid" src="..."> inside .items
        $('.items img').each((i, el) => {
            const src = $(el).attr('src');
            if (src) images.push(src);
        });

        console.log(`Found ${images.length} images/links:`);
        images.forEach(img => console.log(img));

        // Fallback if structure is different (imginn often changes)
        if (images.length === 0) {
            console.log("HTML Snippet:", html.substring(0, 500));
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.log("Status:", error.response.status);
        }
    }
}

testImginn();
