import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from "crypto";

function generateKey(length = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return "Cgxlion_"+result;
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const { name } = await request.json();

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const user = await prisma.users.findUnique({ where: { discordId: decoded.discordId } });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
        }

        const tokenResetCD = await prisma.history.findFirst({
            where: { userId: user.id, name },
            select: { tokenresetcd: true }
        })

        if (tokenResetCD?.tokenresetcd) {
            const now = new Date()
            const expireTime = new Date(tokenResetCD.tokenresetcd)
            const diffMs = expireTime.getTime() - now.getTime()

            if (diffMs > 0) {
                const diffMinutes = Math.floor(diffMs / 1000 / 60)
                const diffSeconds = Math.floor((diffMs / 1000) % 60)

                return NextResponse.json({
                    message: `ตอนนี้ไม่สามารถรีเซ็ตคีย์ได้ กรุณารออีก ${diffMinutes} นาที ${diffSeconds} วินาที`,
                }, { status: 429 })
            }
        }

        const updatedUser = await prisma.history.updateMany({
            where: { userId: user.id, name },
            data: { tokenKey: generateKey(), tokenresetcd: new Date(Date.now() + 60 * 60 * 1000) },
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
