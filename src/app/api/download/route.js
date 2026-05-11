import { NextResponse } from 'next/server';
import { scrapePinterestWithPuppeteer } from '@/lib/pinterest-puppeteer';

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Basic Validation for Pinterest
        if (!url.includes('pinterest.com') && !url.includes('pin.it')) {
            return NextResponse.json({ error: 'Invalid Pinterest URL' }, { status: 400 });
        }

        console.log(`Processing download for: ${url}`);

        // Scrape using Puppeteer
        const data = await scrapePinterestWithPuppeteer(url);

        if (!data || (data.imageUrls.length === 0 && !data.videoUrl)) {
            const errorMessage = data?.isLoginRedirect 
                ? 'Pinterest redirected to a login page. This usually happens when the server IP is blocked.' 
                : 'Failed to extract content. The pin might be private or the format is unsupported.';
            return NextResponse.json({ error: errorMessage }, { status: 422 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Download API Error:', error);
        return NextResponse.json({ error: 'Failed to process request. ' + error.message }, { status: 500 });
    }
}
