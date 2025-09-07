import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from "crypto";

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
            select: { name: true, price: true, monthlyPrice: true, id: true, version: true, repeatable: true },
        });

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
            return sum + (item.monthly ? (product.monthlyPrice ?? product.price) : product.price);
        }, 0);

        if (user.point < totalPrice) {
            return NextResponse.json({ message: 'Point ของท่านคงเหลือไม่เพียงพอ' }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { point: { decrement: totalPrice } }
            }),

            prisma.history.createMany({
                data: cart.map(item => {
                    const product = products.find(p => p.name === item.name);
                    return {
                        name: item.name,
                        discount: null,
                        userId: user.id,
                        tokenKey: generateKey(),
                        version: product?.version ?? undefined, 
                        expire: item.monthly
                            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            : null,
                    };
                })
            }),

            prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { cart: [] }
            })
        ]);

        return NextResponse.json({ message: 'ซื้อสินค้าสำเร็จ' });
    } catch (error: unknown) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) errorMessage = error.message;

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
