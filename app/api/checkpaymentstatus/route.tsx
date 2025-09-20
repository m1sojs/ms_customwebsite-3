import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { loadConfigFromAPI } from '@/lib/websiteConfig';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const { refno } = await request.json();

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const config = await loadConfigFromAPI();
        const serverapi = config.serverApiDomain;
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const user = await prisma.users.findUnique({ where: { discordId: decoded.discordId } });

        if (!user) {
            return NextResponse.json({ message: 'กรุณาล็อคอิน' }, { status: 404 });
        }

        const res = await fetch(`${serverapi}/payment/checkPaymentStatus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refno: refno,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Prompt Pay API failed: ${text}`);
        }

        const resjson = await res.json();

        if (resjson.status) {
            const amount = resjson.amount;

            await prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { point: (user.point || 0) + amount },
            });

            await prisma.topupHistory.create({
                data: {
                    refNo: resjson.refno,
                    userId: user.id,
                    method: "PromptPay",
                    amount: amount,
                    status: "SUCCESS",

                }
            })

            return NextResponse.json({
                status: true,
                amount: amount,
            });
        } else {
            return NextResponse.json({status: false}, { status: 400 });
        }
    } catch (error: unknown) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) errorMessage = error.message;

        return NextResponse.json({
            message: 'เกิดข้อผิดพลาด',
            error: errorMessage,
        }, { status: 500 });
    }
}
