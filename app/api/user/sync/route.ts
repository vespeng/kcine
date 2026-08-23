import { Redis } from '@upstash/redis/cloudflare';
import { NextRequest, NextResponse } from 'next/server';
import { authenticationRequiredResponse } from '@/lib/server/api-responses';
import { getServerSession } from '@/lib/server/auth';

// Ensure this line appears only once in the entire file
export const runtime = 'edge';

const redisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);
const redis = redisConfigured ? Redis.fromEnv() : null;

export async function GET(request: NextRequest) {
  const session = await getServerSession(request);
  const profileId = session?.profileId;
  
  if (!profileId) {
    return authenticationRequiredResponse();
  }

  if (!redis) {
    return NextResponse.json({ success: true, data: null });
  }

  try {
    const data = await redis.get(`user:sync:${profileId}`);
    return NextResponse.json({ 
      success: true, 
      data: data || { history: [], favorites: [] } 
    });
  } catch (error) {
    console.error('Redis Get Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sync data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(request);
  const profileId = session?.profileId;
  
  if (!profileId) {
    return authenticationRequiredResponse();
  }

  if (!redis) {
    return NextResponse.json({ success: true });
  }

  try {
    const body = await request.json();
    const { history, favorites } = body;

    await redis.set(`user:sync:${profileId}`, { history, favorites });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis Set Error:', error);
    return NextResponse.json({ error: 'Failed to save sync data' }, { status: 500 });
  }
}
