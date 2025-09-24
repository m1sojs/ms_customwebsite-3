import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { Prisma } from '@prisma/client';

type CartItem = {
    name: string;
    monthly: boolean;
};

function generateKey(length = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const bytes = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }

    return "Cgxlion_" + result;
}

function isCartItemArray(value: unknown): value is CartItem[] {
    return Array.isArray(value) && value.every(item =>
        typeof item === 'object' &&
        item !== null &&
        'name' in item &&
        'monthly' in item
    );
}

const discountCal = async (code: string | null | undefined, totalPrice: number, cartLength: number) => {
    if (!code) return { finalTotal: totalPrice, perItemDiscount: 0 };

    const discount = await prisma.discountCode.findUnique({
        where: { code },
    });

    if (!discount) return { finalTotal: totalPrice, perItemDiscount: 0 };
    if (discount.count <= 0) return { finalTotal: totalPrice, perItemDiscount: 0 };
    if (discount.expire && discount.expire < new Date()) {
        return { finalTotal: totalPrice, perItemDiscount: 0 };
    }
    if (totalPrice < discount.minDiscount) return { finalTotal: totalPrice, perItemDiscount: 0 };

    let discountAmount = totalPrice * (discount.percent / 100);

    if (discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
    }

    const perItemDiscount = discountAmount / cartLength;
    const finalTotal = totalPrice - discountAmount;

    await prisma.discountCode.update({
        where: { code },
        data: { count: { decrement: 1 } },
    });

    return { finalTotal, perItemDiscount };
};

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const { code } = await request.json();
        const decoded = jwt.verify(token, secret) as { discordId: string };

        const user = await prisma.users.findUnique({
            where: { discordId: decoded.discordId },
            select: { cart: true, point: true, id: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
        }

        const rawCart = user.cart;
        const cart: CartItem[] = isCartItemArray(rawCart) ? rawCart : [];

        if (cart.length === 0) {
            return NextResponse.json({ message: 'ตะกร้าว่างเปล่า' }, { status: 400 });
        }

        const productNames = [...new Set(cart.map(item => item.name))];
        const products = await prisma.products.findMany({
            where: { name: { in: productNames } },
            select: {
                name: true,
                price: true,
                monthlyPrice: true,
                promotionPercent: true,
                id: true,
                version: true,
                repeatable: true,
                stock: true,
            },
        });

        const outOfStock = products.filter(p => p.stock === 0).map(p => p.name);
        if (outOfStock.length > 0) {
            return NextResponse.json({ message: `สินค้าหมดสต็อก: ${outOfStock.join(', ')}` }, { status: 400 });
        }

        const histories = await prisma.history.findMany({
            where: {
                userId: user.id,
                name: { in: productNames },
                OR: [
                    { expire: null },
                    { expire: { gt: new Date() } }
                ]
            },
            select: { name: true }
        });

        const boughtNames = new Set(histories.map(h => h.name));

        const duplicateItems = cart.filter(item => {
            const product = products.find(p => p.name === item.name);
            return boughtNames.has(item.name) && !product?.repeatable;
        });
        if (duplicateItems.length > 0) {
            return NextResponse.json({
                message: `คุณได้ซื้อสินค้าไปแล้ว: ${duplicateItems.map(i => i.name).join(', ')}`
            }, { status: 400 });
        }

        const totalPrice = cart.reduce((sum, item) => {
            const product = products.find(p => p.name === item.name);
            if (!product) return sum;
            return sum + (item.monthly ? (product.monthlyPrice ?? product.price) : (product.price - (product.promotionPercent / 100 * product.price)));
        }, 0);

        const alreadyUsed = await prisma.history.findFirst({
            where: {
                userId: user.id,
                discount: code,
            }
        });

        if (alreadyUsed) {
            return NextResponse.json({ message: 'โค้ดส่วนลดนี้ไม่สามารถใช้งานได้ เนื่องจากได้มีการใช้งานแล้ว' }, { status: 400 });
        }

        const { finalTotal, perItemDiscount } = await discountCal(code, totalPrice, cart.length);

        if (user.point < finalTotal) {
            return NextResponse.json({ message: 'Point ของท่านคงเหลือไม่เพียงพอ' }, { status: 400 });
        }

        const discountedItems = cart.map(item => {
            const product = products.find(p => p.name === item.name);
            if (!product) return { ...item, finalPrice: 0 };

            const basePrice = item.monthly ? (product.monthlyPrice ?? product.price) : (product.price - (product.promotionPercent / 100 * product.price));

            return {
                ...item,
                finalPrice: Math.max(0, basePrice - perItemDiscount)
            };
        });

        const tx: Prisma.PrismaPromise<unknown>[] = [
            prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { point: { decrement: finalTotal }, cart: [] }
            }),

            prisma.history.createMany({
                data: discountedItems.map(item => {
                    const product = products.find(p => p.name === item.name);
                    return {
                        name: item.name,
                        discount: code,
                        price: item.finalPrice,
                        userId: user.id,
                        tokenKey: generateKey(),
                        version: product?.version ?? undefined,
                        expire: item.monthly
                            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            : null,
                    };
                })
            }),
        ];

        for (const product of products) {
            if (product.stock === -1) {
                tx.push(
                    prisma.products.update({
                        where: { name: product.name },
                        data: { buyedCount: { increment: 1 } }
                    })
                );
            } else {
                const qty = cart.filter(item => item.name === product.name).length;
                tx.push(
                    prisma.products.update({
                        where: { name: product.name },
                        data: { stock: { decrement: qty }, buyedCount: { increment: qty } }
                    })
                );
            }
        }

        await prisma.$transaction(tx);

        return NextResponse.json({ message: 'ซื้อสินค้าสำเร็จ' });
    } catch (error: unknown) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) errorMessage = error.message;

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
