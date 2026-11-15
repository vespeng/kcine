import { NextResponse } from 'next/server';

export const runtime = 'edge';

const API_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w780';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
// 封面统一走服务端图片代理，避免客户端直连 TMDB 图片域名失败
const IMAGE_PROXY = '/api/douban/image?url=';

const YEAR_TAG_PATTERN = /^\d{4}$/;

const TMDB_TIMEOUT_MS = 3000; // 上游请求超时时间，超时后前端走豆瓣兜底

// 电影分类标签 → TMDB 类型 ID
const MOVIE_GENRES: Record<string, number> = {
    喜剧: 35,
    爱情: 10749,
    动作: 28,
    恐怖: 27,
    科幻: 878,
    剧情: 18,
    犯罪: 80,
    奇幻: 14,
    战争: 10752,
    悬疑: 9648,
    冒险: 12,
    历史: 36,
    动画: 16,
};

// 电影精选标签 → 排序/筛选参数
const MOVIE_SPECIAL: Record<string, string> = {
    最新: 'sort_by=primary_release_date.desc&vote_count.gte=20',
    豆瓣高分: 'sort_by=vote_average.desc&vote_count.gte=500',
    冷门佳片: 'sort_by=vote_average.desc&vote_count.gte=20&vote_count.lte=500',
    经典: 'sort_by=vote_average.desc&vote_count.gte=3000',
};

// 剧集精选标签 → 排序/筛选参数
const TV_SPECIAL: Record<string, string> = {
    最新: 'sort_by=first_air_date.desc&vote_count.gte=10',
    豆瓣高分: 'sort_by=vote_average.desc&vote_count.gte=200',
    冷门佳片: 'sort_by=vote_average.desc&vote_count.gte=10&vote_count.lte=300',
};

// 电影地区标签 → 来源国家/语言（华语按语言匹配以覆盖两岸三地）
const MOVIE_COUNTRIES: Record<string, { country?: string; language?: string }> = {
    华语: { language: 'zh' },
    大陆: { country: 'CN', language: 'zh' },
    香港: { country: 'HK', language: 'zh' },
    台湾: { country: 'TW', language: 'zh' },
    美国: { country: 'US', language: 'en' },
    英国: { country: 'GB', language: 'en' },
    法国: { country: 'FR', language: 'fr' },
    德国: { country: 'DE', language: 'de' },
    意大利: { country: 'IT', language: 'it' },
    西班牙: { country: 'ES', language: 'es' },
    印度: { country: 'IN', language: 'hi' },
    泰国: { country: 'TH', language: 'th' },
    韩国: { country: 'KR', language: 'ko' },
    日本: { country: 'JP', language: 'ja' },
};

// 剧集地区标签 → 来源国家/语言（国产/国产剧为兼容别名）
const TV_COUNTRIES: Record<string, { country: string; language: string }> = {
    国产: { country: 'CN', language: 'zh' },
    国产剧: { country: 'CN', language: 'zh' },
    美剧: { country: 'US', language: 'en' },
    日剧: { country: 'JP', language: 'ja' },
    韩剧: { country: 'KR', language: 'ko' },
    港剧: { country: 'HK', language: 'zh' },
    英剧: { country: 'GB', language: 'en' },
};

// 剧集类型标签 → TMDB 类型 ID
const TV_GENRES: Record<string, number> = {
    综艺: 10764,
    真人秀: 10764,
    脱口秀: 10767,
    动漫: 16,
    纪录片: 99,
};

// 剧集地区+类型组合标签（动漫分区按地区筛选）
const TV_REGION_GENRES: Record<string, { genre: number; country: string; language: string }> = {
    日漫: { genre: 16, country: 'JP', language: 'ja' },
    国漫: { genre: 16, country: 'CN', language: 'zh' },
    美漫: { genre: 16, country: 'US', language: 'en' },
};

interface TmdbItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
}

const isBearerToken = (apiKey: string): boolean => apiKey.startsWith('eyJ') || apiKey.length > 60;

/**
 * 组装 TMDB 请求选项：v4 Bearer Token 走 Authorization 头，v3 key 拼接查询参数
 */
const buildFetchInit = (apiKey: string): RequestInit =>
    isBearerToken(apiKey) ? { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } } : { next: { revalidate: 3600 } };

const appendApiKey = (url: string, apiKey: string): string =>
    isBearerToken(apiKey) ? url : `${url}&api_key=${apiKey}`;

/**
 * 带超时的上游请求：网络不可达时快速中断，避免前端长时间等待
 */
const fetchWithTimeout = (url: string, init: RequestInit, timeoutMs: number): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
};

const discoverMovie = (params: string): string => `/discover/movie?sort_by=popularity.desc&${params}`;

const discoverTv = (params: string): string => `/discover/tv?sort_by=popularity.desc&${params}`;

/**
 * 电影标签 → TMDB 查询路径；兼容来源数据中的「XX片」形式
 */
const buildMoviePath = (tag: string): string | null => {
    if (MOVIE_SPECIAL[tag]) return `/discover/movie?${MOVIE_SPECIAL[tag]}`;
    if (MOVIE_GENRES[tag]) return discoverMovie(`with_genres=${MOVIE_GENRES[tag]}`);
    const stripped = tag.replace(/片$/, '');
    if (MOVIE_GENRES[stripped]) return discoverMovie(`with_genres=${MOVIE_GENRES[stripped]}`);
    const region = MOVIE_COUNTRIES[tag];
    if (region) {
        const params = [region.country && `with_origin_country=${region.country}`, region.language && `with_original_language=${region.language}`]
            .filter(Boolean)
            .join('&');
        return discoverMovie(params);
    }
    if (YEAR_TAG_PATTERN.test(tag)) return discoverMovie(`primary_release_year=${tag}`);
    return null;
};

/**
 * 剧集标签 → TMDB 查询路径
 */
const buildTvPath = (tag: string): string | null => {
    if (TV_SPECIAL[tag]) return `/discover/tv?${TV_SPECIAL[tag]}`;
    const regionGenre = TV_REGION_GENRES[tag];
    if (regionGenre) {
        return discoverTv(`with_genres=${regionGenre.genre}&with_origin_country=${regionGenre.country}&with_original_language=${regionGenre.language}`);
    }
    if (TV_GENRES[tag]) return discoverTv(`with_genres=${TV_GENRES[tag]}`);
    const country = TV_COUNTRIES[tag];
    if (country) return discoverTv(`with_origin_country=${country.country}&with_original_language=${country.language}`);
    if (YEAR_TAG_PATTERN.test(tag)) return discoverTv(`first_air_date_year=${tag}`);
    return null;
};

/**
 * 按分类标签查询 TMDB 影片列表：热门走 Trending，其余按类型/地区/年份/精选 Discover。
 * 返回结构与豆瓣 recommend 接口一致（subjects），并额外携带横版剧照 backdrop。
 * 未配置 TMDB_API_KEY、标签无映射或查询失败时返回空列表，由前端回退豆瓣数据。
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') === 'tv' ? 'tv' : 'movie';
    const tag = searchParams.get('tag') || '热门';
    const page = searchParams.get('page') || '1';

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ subjects: [] });
    }

    const path = tag === '热门' ? `/trending/${type}/week` : type === 'movie' ? buildMoviePath(tag) : buildTvPath(tag);
    if (!path) {
        return NextResponse.json({ subjects: [] });
    }

    try {
        // 热门路径不含查询串，需按是否已有参数选择分隔符
        const separator = path.includes('?') ? '&' : '?';
        const url = appendApiKey(`${API_BASE}${path}${separator}language=zh-CN&include_adult=false&page=${page}`, apiKey);
        const response = await fetchWithTimeout(url, buildFetchInit(apiKey), TMDB_TIMEOUT_MS);

        // 上游不可达标记为 unavailable（区别于标签无映射），前端据此熔断跳过 TMDB
        if (!response.ok) {
            return NextResponse.json({ subjects: [], unavailable: true });
        }

        const data = await response.json();
        const subjects = ((data.results || []) as TmdbItem[])
            .filter((item) => item.poster_path)
            .map((item) => ({
                id: `${type}-${item.id}`,
                title: item.title || item.name || '',
                cover: `${IMAGE_PROXY}${encodeURIComponent(`${POSTER_BASE}${item.poster_path}`)}`,
                backdrop: item.backdrop_path
                    ? `${IMAGE_PROXY}${encodeURIComponent(`${BACKDROP_BASE}${item.backdrop_path}`)}`
                    : null,
                rate: item.vote_average > 0 ? item.vote_average.toFixed(1) : '',
                url: `https://www.themoviedb.org/${type}/${item.id}`,
            }));
        return NextResponse.json({ subjects });
    } catch (error) {
        console.error('TMDB API error:', error);
        return NextResponse.json({ subjects: [], unavailable: true });
    }
}
