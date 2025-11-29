import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'MonadFlow Backend',
    contract: config.contractAddress,
    timestamp: new Date().toISOString(),
  });
}

