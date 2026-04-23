import puppeteer from 'puppeteer';

/**
 * Scrapes Pinterest pin data using Puppeteer.
 * Optimized for speed by blocking assets and extracting initial state JSON.
 * @param {string} url - The Pinterest pin URL.
 * @returns {Promise<Object>} - The scraped data.
 */
export async function scrapePinterestWithPuppeteer(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ],
        });

        const page = await browser.newPage();

        // 1. Optimization: Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

        console.log(`[Puppeteer] Navigating to ${url}...`);

        // 2. Navigation: Wait for DOM only, don't wait for all network calls
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // --- ERROR/REDIRECT HANDLING ---
        // Pinterest often redirects shared links (pin.it) to .../sent/?invite_code=... which can fail/show error.
        // We need to check if we landed on an error page or a "sent" page and try to clean the URL.
        const finalUrl = page.url();
        const isErrorPage = finalUrl.includes('show_error=true') || finalUrl.includes('/sent/');

        async function tryCleanUrl(currentResponse) {
            const chain = currentResponse.request().redirectChain();
            const allUrls = chain.map(req => req.url()).concat([url, finalUrl]);

            // Extract Pin ID from any URL in the chain
            // Pattern: /pin/123456789/
            const pinIdMatch = allUrls.map(u => u.match(/\/pin\/(\d+)\//)).find(m => m && m[1]);

            if (pinIdMatch && pinIdMatch[1]) {
                const cleanUrl = `https://www.pinterest.com/pin/${pinIdMatch[1]}/`;
                console.log(`[Puppeteer] Detected potential error/redirect issue. Retrying with clean URL: ${cleanUrl}`);
                await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                return true;
            }
            return false;
        }

        if (isErrorPage) {
            await tryCleanUrl(response);
        } else {
            // Double check content for "Login" or "Error" just in case URL looked fine
            const title = await page.title();
            if (title === "Pinterest" || title.includes("Error")) {
                // Might be a soft error or generic home page redirect
                await tryCleanUrl(response);
            }
        }


        // 3. Extraction: Try getting data from Page Source (Regex is faster/more reliable for hidden JSON)
        const content = await page.content();

        const data = await page.evaluate((html) => {
            const result = {
                imageUrls: [],
                videoUrl: null,
                caption: '',
                author: '',
                authorName: ''
            };

            // --- 0. JSON-LD Extraction (Most Reliable for Video) ---
            try {
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                for (const script of scripts) {
                    try {
                        const json = JSON.parse(script.innerText);
                        // Check if it's a VideoObject or has a video property
                        // Pinterest often puts the main Pin as a top-level VideoObject or inside a graph
                        let videoObj = null;

                        if (json['@type'] === 'VideoObject') {
                            videoObj = json;
                        } else if (json['@type'] === 'SocialMediaPosting' && json.sharedContent && json.sharedContent['@type'] === 'VideoObject') {
                            videoObj = json.sharedContent;
                        } else if (json.video) {
                            videoObj = json.video;
                        }

                        if (videoObj && videoObj.contentUrl) {
                            result.videoUrl = videoObj.contentUrl;
                        }

                        if (videoObj && videoObj.thumbnailUrl) {
                            result.imageUrls.push(videoObj.thumbnailUrl);
                        }

                        if (json.name && !result.caption) result.caption = json.name;
                        if (json.description && !result.caption) result.caption = json.description;

                        if (result.videoUrl) break;
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            } catch (e) {
                // Ignore DOM errors
            }

            if (result.videoUrl) {
                return result;
            }

            // --- Regex Extraction (Fastest & Most Accurate) ---
            try {
                // 1. Image (Original Size)
                // Pattern: "images_orig":{"url":"https://..."}
                const imgMatch = html.match(/"images_orig":\s*\{\s*"url":\s*"(https:\/\/[^"]+)"/);
                if (imgMatch && imgMatch[1]) {
                    result.imageUrls.push(imgMatch[1]);
                }

                // 2. Video (MP4)
                // Pattern: "V_720P":{"url":"https://..."}
                const vidMatch = html.match(/"V_720P":\s*\{\s*"url":\s*"(https:\/\/[^"]+)"/);
                if (vidMatch && vidMatch[1]) {
                    result.videoUrl = vidMatch[1];
                } else {
                    // Fallback to any video url in video_list
                    const anyVidMatch = html.match(/"video_list":\s*\{[^}]*"url":\s*"(https:\/\/[^"]+\.mp4)"/);
                    if (anyVidMatch && anyVidMatch[1]) {
                        result.videoUrl = anyVidMatch[1];
                    }
                }

                // 3. Metadata
                const titleMatch = html.match(/"gridTitle":\s*"(.*?)"/);
                if (titleMatch && titleMatch[1]) result.caption = titleMatch[1];

                const descMatch = html.match(/"description":\s*"(.*?)"/);
                if (descMatch && descMatch[1] && !result.caption) result.caption = descMatch[1];

                const userMatch = html.match(/"username":\s*"(.*?)"/);
                if (userMatch && userMatch[1]) result.author = userMatch[1];

                const nameMatch = html.match(/"fullName":\s*"(.*?)"/);
                if (nameMatch && nameMatch[1]) result.authorName = nameMatch[1];

                // If we found the main image/video via Regex, we still want to continue to DOM fallback if video is missing
                if (result.videoUrl) {
                    console.log("[Puppeteer] Video found via Regex.");
                } else {
                    console.log("[Puppeteer] Video NOT found via Regex. Continuing to DOM fallback...");
                }

            } catch (e) {
                console.log("Regex parsing failed", e);
            }

            // --- DOM Fallback (Strict Mode) ---
            // Only look if Regex failed.

            // 1. Metadata
            const h1 = document.querySelector('h1');
            if (h1) result.caption = h1.innerText;

            const ownerName = document.querySelector('[data-test-id="official-user-attribution"] a') ||
                document.querySelector('[data-test-id="pin-attribution-user-name"] a');
            if (ownerName) {
                result.authorName = ownerName.innerText;
                if (ownerName.href) {
                    const parts = ownerName.href.split('/');
                    if (parts.length > 3) result.author = parts[3];
                }
            }

            // 2. Visuals
            const video = document.querySelector('video');
            if (video && !result.videoUrl) {
                result.videoUrl = video.src; // Likely blob, might fail download, but better than nothing if regex failed
            }

            // Helper to get srcset best match
            const getBestImg = (img) => {
                if (img.srcset) {
                    const c = img.srcset.split(',').map(s => s.trim().split(' '));
                    return c[c.length - 1][0];
                }
                return img.src;
            };

            const visualWrapper = document.querySelector('[data-test-id="pin-visual-wrapper"]');
            if (visualWrapper) {
                const img = visualWrapper.querySelector('img');
                if (img) result.imageUrls.push(getBestImg(img));
            }

            // STRICT MODE: Removed generic fallback to avoid "More like this" images.
            // If we didn't find it in the wrapper or regex, returns empty (better than wrong).

            return result;
        }, content); // Pass content to evaluate

        // Ensure we don't have duplicates
        data.imageUrls = [...new Set(data.imageUrls)];

        // Clean up text
        if (data.caption) {
            // Unescape unicode if needed, though JSON usually handles it
            // Simple replace for common issues
            data.caption = data.caption.replace(/\\u([\d\w]{4})/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
        }

        return data;


    } catch (error) {
        console.error("[Pinterest Puppeteer] Error:", error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}
