const axios = require('axios');

const url = "https://www.instagram.com/p/DMfD38JRY-X/?__a=1&__d=dis";

async function testJson() {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 239.1.0.26.109',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest' // sometimes helps
        };

        console.log(`Fetching: ${url}`);
        const response = await axios.get(url, { headers });

        console.log("Status:", response.status);
        console.log("Data snippet:", JSON.stringify(response.data).substring(0, 500));

        if (response.data && response.data.graphql && response.data.graphql.shortcode_media) {
            console.log("Found Media URL:", response.data.graphql.shortcode_media.display_url);
        } else if (response.data && response.data.items) {
            // sometimes it returns items array
            console.log("Found Items Media URL:", response.data.items[0].image_versions2.candidates[0].url);
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data); // See if it's a login page HTML or JSON error
        }
    }
}

testJson();
