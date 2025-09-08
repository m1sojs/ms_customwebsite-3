import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { loadConfigFromAPI } from '@/lib/websiteConfig';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const { id, name, newIP } = await request.json();

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const config = await loadConfigFromAPI();
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const user = await prisma.users.findUnique({ where: { discordId: decoded.discordId } });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
        }

        const ipChangeCD = await prisma.history.findFirst({
            where: { userId: user.id, id, name },
            select: { ipchangecd: true }
        })

        if (ipChangeCD?.ipchangecd) {
            const now = new Date()
            const expireTime = new Date(ipChangeCD.ipchangecd)
            const diffMs = expireTime.getTime() - now.getTime()

            if (diffMs > 0) {
                const diffMinutes = Math.floor(diffMs / 1000 / 60)
                const diffSeconds = Math.floor((diffMs / 1000) % 60)

                return NextResponse.json({
                    message: `ตอนนี้ไม่สามารถเปลี่ยนไอพีได้ กรุณารออีก ${diffMinutes} นาที ${diffSeconds} วินาที`,
                }, { status: 429 })
            }
        }

        const updatedUser = await prisma.history.updateMany({
            where: { userId: user.id, id, name },
            data: { ip: newIP, ipchangecd: new Date(Date.now() + Number(config.changeIpCooldown)) },
        })

        return NextResponse.json({ message: 'แก้ไขไอพีสำเร็จ', updatedUser });

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
