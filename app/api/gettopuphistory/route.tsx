import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  if (!token) {
    return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, secret) as { discordId: string };

    const user = await prisma.users.findUnique({
      where: { discordId: decoded.discordId },
      select: {
        id: true,
        topupHistory: {
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    if (!user) return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });

    return NextResponse.json({ topuphistory: user.topupHistory }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      message: 'เกิดข้อผิดพลาด',
      error: errorMessage,
    }, { status: 500 });
  }
}
