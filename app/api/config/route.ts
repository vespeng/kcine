/**
 * Config API Route (Simplified)
 * Only returns non-auth configuration now.
 * Auth has moved to /api/auth.
 */

import { NextResponse } from 'next/server';
import { getRuntimeEnvValue } from '@/lib/server/auth';

export const runtime = 'edge';

export async function GET() {
    return NextResponse.json({
        subscriptionSources: getRuntimeEnvValue('SUBSCRIPTION_SOURCES'),
    });
}
