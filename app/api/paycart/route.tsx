import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

type CartItem = {
    name: string;
    monthly: boolean;
};

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
            select: { name: true, price: true, id: true },
        });

        const totalPrice = products.reduce((sum, item) => sum + item.price, 0);

        if (user.point < totalPrice) {
            return NextResponse.json({ message: 'Point ของท่านคงเหลือไม่เพียงพอ' }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { point: { decrement: totalPrice } }
            }),

            prisma.history.createMany({
                data: cart.map(item => ({
                    name: item.name,
                    discount: null,
                    userId: user.id,
                    expire: item.monthly == true
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        : null,
                }))
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
