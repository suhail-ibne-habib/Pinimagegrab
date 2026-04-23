const axios = require('axios');

const url = "https://www.instagram.com/p/DMfD38JRY-X/media/?size=l";

async function testRedirect() {
    try {
        console.log(`Testing redirect: ${url}`);
        const response = await axios.get(url, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            },
        });

        console.log("Status:", response.status);
        if (response.status === 301 || response.status === 302) {
            console.log("Location:", response.headers.location);
        } else {
            console.log("Did not get a redirect. Content-Type:", response.headers['content-type']);
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.log("Response Status:", error.response.status);
        }
    }
}

testRedirect();
