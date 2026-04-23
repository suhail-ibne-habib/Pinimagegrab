import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
        });

        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `attachment; filename="download.${contentType.split('/')[1] || 'bin'}"`);

        return new NextResponse(response.data, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}
