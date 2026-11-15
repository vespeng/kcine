/**
 * 豆瓣推荐列表请求客户端封装
 * 请求失败或响应异常时返回空数组，由调用方按空结果处理
 */

import type { MediaItem } from '@/lib/types';

const DEFAULT_LIMIT = 14;

/**
 * 按标签查询豆瓣推荐列表（limit 单页数量，pageStart 起始偏移），失败时返回空数组
 */
export async function fetchDoubanSubjects(
  type: 'movie' | 'tv',
  tag: string,
  limit = DEFAULT_LIMIT,
  pageStart = 0
): Promise<MediaItem[]> {
  const params = new URLSearchParams({
    type,
    tag,
    page_limit: String(limit),
    page_start: String(pageStart),
  });
  try {
    const res = await fetch(`/api/douban/recommend?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.subjects || []) as MediaItem[];
  } catch {
    return [];
  }
}
