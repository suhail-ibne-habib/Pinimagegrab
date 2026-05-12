import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes Pinterest pin data using a lightweight Axios + Cheerio approach.
 * This is 10x faster and more reliable on shared hosting than Puppeteer.
 * @param {string} url - The Pinterest pin URL.
 * @returns {Promise<Object>} - The scraped data.
 */
export async function scrapePinterestWithPuppeteer(url) {
    try {
        console.log(`[Scraper] Fetching ${url} with Axios...`);

        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        ];

        let response;
        let lastError;
        let targetUrl = url;

        // Try to resolve pin.it redirect separately if needed
        if (url.includes('pin.it')) {
            try {
                const head = await axios.get(url, { 
                    maxRedirects: 0, 
                    validateStatus: () => true, // Don't throw on any status
                    headers: { 'User-Agent': userAgents[0] }
                });
                if (head.status >= 300 && head.status < 400 && head.headers.location) {
                    targetUrl = head.headers.location;
                    console.log(`[Scraper] Resolved redirect to: ${targetUrl}`);
                }
            } catch (e) {
                console.warn(`[Scraper] Redirect resolution failed: ${e.message}`);
            }
        }

        for (const ua of userAgents) {
            try {
                console.log(`[Scraper] Fetching with UA: ${ua.substring(0, 30)}...`);
                response = await axios.get(targetUrl, {
                    headers: {
                        'User-Agent': ua,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.google.com/',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'cross-site',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    maxRedirects: 5,
                    timeout: 12000,
                    validateStatus: () => true
                });

                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    
                    const bodyText = $('body').text().toLowerCase();
                    const isLoginPage = (bodyText.includes('login') || bodyText.includes('sign up')) && bodyText.length < 8000;

                    if (!isLoginPage) break;
                    console.warn(`[Scraper] Hit login wall with UA: ${ua.substring(0, 30)}`);
                } else {
                    console.warn(`[Scraper] Status ${response.status} with UA: ${ua.substring(0, 30)}`);
                }
            } catch (e) {
                lastError = e;
                console.warn(`[Scraper] Request failed: ${e.message}`);
            }
        }

        if (!response || response.status !== 200) {
            return {
                imageUrls: [],
                videoUrl: null,
                error: `Pinterest blocked the request (Status ${response?.status || 'Error'}). This is common on shared hosting IPs.`,
                isLoginRedirect: true
            };
        }

        const html = response.data;
        const $ = cheerio.load(html);
        
        // Check if we were redirected to a login page
        const finalUrl = response.request.res.responseUrl || url;
        let isLoginRedirect = false;
        
        // Robust login detection
        const bodyText = $('body').text().toLowerCase();
        const hasLoginText = bodyText.includes('login') || bodyText.includes('sign up') || bodyText.includes('password');
        
        if (finalUrl.includes('/login/') || finalUrl.includes('?next=') || (hasLoginText && bodyText.length < 5000)) {
            console.warn(`[Scraper] Redirected to or found login page: ${finalUrl}`);
            isLoginRedirect = true;
        }
        
        const result = {
            imageUrls: [],
            videoUrl: null,
            caption: '',
            author: '',
            authorName: '',
            isLoginRedirect: isLoginRedirect
        };

        // --- 1. Extract from __PWS_DATA__ (Most Reliable) ---
        try {
            const pwsDataScript = $('#__PWS_DATA__').html();
            if (pwsDataScript) {
                const pwsData = JSON.parse(pwsDataScript);
                const pinData = pwsData.props?.initialReduxState?.pins;
                
                if (pinData) {
                    // Find the pin object (it's keyed by the pin ID)
                    const pinId = Object.keys(pinData)[0];
                    const pin = pinData[pinId];

                    if (pin) {
                        // Images
                        if (pin.images?.orig?.url) {
                            result.imageUrls.push(pin.images.orig.url);
                        }

                        // Videos
                        const videoData = pin.videos?.video_list;
                        if (videoData) {
                            // Prefer 720p or highest available
                            const qualities = ['V_720P', 'V_HLSV4', 'V_IPHONE_LOW', 'V_V7_HLSV4'];
                            for (const q of qualities) {
                                if (videoData[q]?.url) {
                                    result.videoUrl = videoData[q].url;
                                    break;
                                }
                            }
                            // Fallback to any URL in video_list
                            if (!result.videoUrl) {
                                const firstKey = Object.keys(videoData)[0];
                                if (videoData[firstKey]?.url) {
                                    result.videoUrl = videoData[firstKey].url;
                                }
                            }
                        }

                        // Metadata
                        result.caption = pin.title || pin.description || '';
                        result.authorName = pin.pinner?.full_name || '';
                        result.author = pin.pinner?.username || '';
                    }
                }
            }
        } catch (e) {
            console.error("[Scraper] Error parsing PWS_DATA:", e.message);
        }

        if (result.videoUrl || result.imageUrls.length > 0) {
            console.log("[Scraper] Found data using PWS_DATA");
        }

        // --- 2. Fallback: Extract from JSON-LD ---
        try {
            $('script[type="application/ld+json"]').each((i, el) => {
                try {
                    const json = JSON.parse($(el).html());
                    
                    let videoObj = null;
                    if (json['@type'] === 'VideoObject') videoObj = json;
                    else if (json.video) videoObj = json.video;

                    if (videoObj && videoObj.contentUrl && !result.videoUrl) {
                        result.videoUrl = videoObj.contentUrl;
                    }
                    if (videoObj && videoObj.thumbnailUrl) {
                        result.imageUrls.push(videoObj.thumbnailUrl);
                    }

                    if (json.name && !result.caption) result.caption = json.name;
                    if (json.description && !result.caption) result.caption = json.description;
                } catch (e) {}
            });
        } catch (e) {}

        if (result.videoUrl || result.imageUrls.length > 0) {
            console.log("[Scraper] Found data using JSON-LD");
        }

        // --- 3. Fallback: Extract from Meta Tags (og tags) ---
        try {
            if (!result.videoUrl) {
                const metaVideo = $('meta[property="og:video:secure_url"]').attr('content') || 
                                 $('meta[property="og:video"]').attr('content') ||
                                 $('meta[name="twitter:player:stream"]').attr('content');
                if (metaVideo) {
                    result.videoUrl = metaVideo;
                }
            }
            if (result.imageUrls.length === 0) {
                const metaImage = $('meta[property="og:image"]').attr('content') || 
                                 $('meta[name="twitter:image"]').attr('content');
                if (metaImage) {
                    result.imageUrls.push(metaImage);
                }
            }
            if (!result.caption) {
                result.caption = $('meta[property="og:title"]').attr('content') || 
                                 $('meta[name="description"]').attr('content') || 
                                 $('title').text();
            }
        } catch (e) {
            console.error("[Scraper] Error parsing meta tags:", e.message);
        }

        if (result.videoUrl || result.imageUrls.length > 0) {
            console.log("[Scraper] Found data using Meta Tags");
        }

        // --- 4. Fallback: Regex for raw strings (Last Resort) ---
        console.log("[Scraper] Trying Regex fallback...");
        if (!result.videoUrl) {
            const vidMatch = html.match(/"V_720P":\s*\{\s*"url":\s*"(https:\/\/[^"]+)"/);
            if (vidMatch) {
                result.videoUrl = vidMatch[1].replace(/\\u002f/g, '/');
            } else {
                // Global fallback for any mp4
                const mp4Match = html.match(/https:\/\/[^"'\s]+\.mp4/);
                if (mp4Match) result.videoUrl = mp4Match[0].replace(/\\u002f/g, '/');
            }
        }
        if (result.imageUrls.length === 0) {
            const imgMatch = html.match(/"images_orig":\s*\{\s*"url":\s*"(https:\/\/[^"]+)"/);
            if (imgMatch) result.imageUrls.push(imgMatch[1].replace(/\\u002f/g, '/'));
        }

        // Additional Regex for any high-res pinterest image
        if (result.imageUrls.length === 0) {
            const genericImgMatch = html.match(/"url":\s*"(https:\/\/i\.pinimg\.com\/originals\/[^"]+)"/);
            if (genericImgMatch) result.imageUrls.push(genericImgMatch[1].replace(/\\u002f/g, '/'));
        }

        // Deduplicate, clean, and upgrade
        result.imageUrls = [...new Set(result.imageUrls)].map(url => url.replace(/\/(736x|564x|474x|236x)\//, '/originals/'));
        
        if (result.imageUrls.length > 0 || result.videoUrl) {
            console.log("[Scraper] Success using Regex");
        } else {
            console.warn("[Scraper] All extraction methods failed.");
        }

        return result;

    } catch (error) {
        console.error("[Scraper] Error:", error.message);
        throw error;
    }
}
