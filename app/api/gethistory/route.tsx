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
        history: {
          orderBy: { createdAt: 'desc' },
          select: {
            name: true,
            discount: true,
            expire: true,
            ip: true,
            
            createdAt: true,
          }
        }
      }
    });

    if (!user) return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    const productNames = [...new Set(user.history.map(item => item.name))];
    const products = await prisma.products.findMany({
      where: {
        name: { in: productNames }
      },
      select: {
        name: true,
        label: true,
        price: true,
        image: true,
        downloadLink: true
      }
    });

    const enrichedHistory = user.history.map(item => {
      const product = products.find(p => p.name === item.name);
      return {
        ...item,
        ...product
      };
    });

    return NextResponse.json({ history: enrichedHistory }, { status: 200 });
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
