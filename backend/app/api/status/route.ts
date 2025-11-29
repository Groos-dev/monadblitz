import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  return NextResponse.json({
    listening: true,
    contract: config.contractAddress,
    rpc: config.monadRpcUrl,
  });
}

