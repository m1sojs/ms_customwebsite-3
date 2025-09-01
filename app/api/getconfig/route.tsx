import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.webConfig.findFirst();
    const formatConfig = config?.webconfig

    return NextResponse.json(formatConfig);
  } catch (error) {
    console.error('Error fetching website config:', error);
    return NextResponse.json(
      { message: 'Failed to fetch website config' },
      { status: 500 }
    );
  }
}