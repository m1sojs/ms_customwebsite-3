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

    return "Cgxlion_" + result;
}

const discountCal = async (code: string | null | undefined, price: number) => {
    if (!code) return price;

    const discount = await prisma.discountCode.findUnique({
        where: { code },
    });

    if (!discount) return price;

    if (discount.count <= 0) return price;

    if (discount.expire && discount.expire < new Date()) {
        return price;
    }

    if (price < discount.minDiscount) return price;

    let discountAmount = price * (discount.percent / 100);

    if (discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
    }

    const finalPrice = price - discountAmount;

    await prisma.discountCode.update({
        where: { code },
        data: { count: { decrement: 1 } },
    });

    return finalPrice;
};

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const { name, monthly, code } = await request.json();

        const user = await prisma.users.findUnique({
            where: { discordId: decoded.discordId },
            select: { cart: true, point: true, id: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
        }

        const product = await prisma.products.findMany({
            where: { name: name },
            select: { name: true, price: true, monthlyPrice: true, promotionPercent: true, id: true, version: true, repeatable: true },
        });

        const alreadyBought = await prisma.history.findFirst({
            where: {
                userId: user.id,
                name: name,
                OR: [
                    { expire: null },
                    { expire: { gt: new Date() } }
                ]
            }
        });

        if (alreadyBought && !product[0].repeatable) {
            return NextResponse.json({ message: 'คุณได้ซื้อสินค้านี้ไปแล้ว ไม่สามารถซื้อซ้ำได้' }, { status: 400 });
        }

        const alreadyUsed = await prisma.history.findFirst({
            where: {
                userId: user.id,
                discount: code,
            }
        });

        const totalPrice = alreadyUsed ? (product[0].price - (product[0].promotionPercent / 100 * product[0].price)) : await discountCal(code, (product[0].price - (product[0].promotionPercent / 100 * product[0].price)));

        if (user.point < await totalPrice) {
            return NextResponse.json({ message: 'Point ของท่านคงเหลือไม่เพียงพอ' }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { point: { decrement: monthly == true ? product[0].monthlyPrice : totalPrice } }
            }),

            prisma.products.update({
                where: { name: product[0].name },
                data: { stock: { decrement: 1 }, buyedCount: { increment: 1 } }
            }),

            prisma.history.createMany({
                data: {
                    name: product[0].name,
                    discount: alreadyUsed ? null : code,
                    price: totalPrice,
                    userId: user.id,
                    tokenKey: generateKey(),
                    version: product[0].version,
                    expire: monthly == true
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        : null,
                }
            }),
        ]);

        return NextResponse.json({ message: 'ซื้อสินค้าสำเร็จ' });
    } catch (error: unknown) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) errorMessage = error.message;

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
