/**
 * TMDB 列表请求客户端封装
 * 上游不可达时短期记录熔断状态（sessionStorage），期间跳过 TMDB 由调用方直接走豆瓣兜底
 */

import type { MediaItem } from '@/lib/types';

const UNAVAILABLE_KEY = 'kcine_tmdb_unavailable_until';
const UNAVAILABLE_DURATION_MS = 5 * 60 * 1000;

const isUnavailable = (): boolean => {
  try {
    const until = Number(sessionStorage.getItem(UNAVAILABLE_KEY));
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
};

const markUnavailable = (): void => {
  try {
    sessionStorage.setItem(UNAVAILABLE_KEY, String(Date.now() + UNAVAILABLE_DURATION_MS));
  } catch {
    // 隐私模式等存储异常时忽略，仅失去熔断加速
  }
};

/**
 * 查询 TMDB 列表；不可用、熔断或失败时返回空数组，调用方回退豆瓣
 */
export async function fetchTmdbSubjects(
  type: 'movie' | 'tv',
  tag: string,
  page = 1
): Promise<MediaItem[]> {
  if (isUnavailable()) return [];
  try {
    const res = await fetch(`/api/tmdb/list?type=${type}&tag=${encodeURIComponent(tag)}&page=${page}`);
    if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
    const data = await res.json();
    if (data.unavailable) {
      markUnavailable();
      return [];
    }
    return (data.subjects || []) as MediaItem[];
  } catch {
    markUnavailable();
    return [];
  }
}
