import { NextResponse } from 'next/server';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';

export const runtime = 'edge';

export const revalidate = 3600; // Cache for 1 hour

interface Category {
    type_id: number;
    type_name: string;
}

// 按订阅源分组的分类列表，供高级页「源 → 标签」两级筛选
interface SourceGroup {
    sourceId: string;
    sourceName: string;
    categories: { id: string; name: string }[];
}

// Shared handler
async function handleTypesRequest(sourceList: any[]) {
    try {
        const enabledSources = sourceList.filter(s => s.enabled);

        const results = await Promise.allSettled(
            enabledSources.map(async (source: any) => {
                try {
                    const url = new URL(source.baseUrl);
                    url.searchParams.set('ac', 'list');

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                    const response = await fetch(url.toString(), {
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        },
                        next: { revalidate: 3600 }
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    const data = await response.json();
                    return {
                        sourceId: source.id,
                        sourceName: source.name,
                        categories: data.class || []
                    };
                } catch (error) {
                    console.error(`Failed to fetch categories from ${source.name}:`, error);
                    return null;
                }
            })
        );

        const sources: SourceGroup[] = [];

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                const { sourceId, sourceName, categories } = result.value;
                const mapped = (categories as Category[])
                    .filter(cat => cat.type_name?.trim())
                    .map(cat => ({ id: String(cat.type_id), name: cat.type_name.trim() }));

                if (mapped.length > 0) {
                    sources.push({ sourceId, sourceName, categories: mapped });
                }
            }
        });

        return NextResponse.json({ sources });
    } catch (error) {
        console.error('Failed to aggregate categories:', error);
        return NextResponse.json(
            { sources: [], error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sources } = body;
        return await handleTypesRequest(sources || []);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function GET() {
    return await handleTypesRequest(PREMIUM_SOURCES);
}
