import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { loadConfigFromAPI } from '@/lib/websiteConfig';

function generateRefNO(length = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const bytes = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }

    return result;
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const { voucher } = await request.json();

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const config = await loadConfigFromAPI();
        const phoneNumber = config.promptPayID;
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const user = await prisma.users.findUnique({ where: { discordId: decoded.discordId } });

        if (!user) {
            return NextResponse.json({ message: 'กรุณาล็อคอิน' }, { status: 404 });
        }

        const code = voucher.replace(
            "https://gift.truemoney.com/campaign/?v=",
            ""
        );

        if (!/^[a-z0-9]*$/i.test(code)) {
            return NextResponse.json({
                message: "Voucher only allows English alphabets or numbers.",
            }, { status: 400 });
        }

        if (code.length <= 0) {
            return NextResponse.json({
                message: "Voucher code cannot be empty.",
            }, { status: 400 });
        }

        const res = await fetch(`https://gift.truemoney.com/campaign/vouchers/${code}/redeem`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mobile: phoneNumber,
                voucher_hash: code,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Voucher API failed: ${text}`);
        }

        const resjson = await res.json();

        if (resjson.status?.code === "SUCCESS") {
            const amount = parseInt(resjson.data.voucher.redeemed_amount_baht, 10);

            await prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { point: (user.point || 0) + amount },
            });

            await prisma.topupHistory.create({
                data: {
                    refNo: generateRefNO(),
                    userId: user.id,
                    method: "TrueVoucher",
                    amount: amount,
                    status: "SUCCESS",

                }
            })

            return NextResponse.json({
                amount: amount,
            });
        } else {
            return NextResponse.json({
                message: resjson.status?.message ?? "Unknown error",
            }, { status: 400 });
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
