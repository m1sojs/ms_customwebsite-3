import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const { id, name } = await request.json();

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const user = await prisma.users.findUnique({ where: { discordId: decoded.discordId } });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
        }

        const currentHistory = await prisma.history.findFirst({
            where: { userId: user.id, id, name },
            select: { expire: true }
        });

        let newExpire: Date;

        if (currentHistory?.expire && currentHistory.expire > new Date()) {
            newExpire = new Date(currentHistory.expire.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else {
            newExpire = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        const updatedUser = await prisma.history.updateMany({
            where: { userId: user.id, id, name },
            data: { expire: newExpire },
        });

        return NextResponse.json({ 
            message: 'เติมรายเดือนสำเร็จ', 
            newExpire, 
            updatedUser 
        });

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
