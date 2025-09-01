import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const { name, monthly } = await request.json();

        const user = await prisma.users.findUnique({
            where: { discordId: decoded.discordId },
            select: { cart: true, point: true, id: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
        }
        const product = await prisma.products.findMany({
            where: { name: name },
            select: { name: true, price: true, id: true },
        });

        if (user.point < product[0].price) {
            return NextResponse.json({ message: 'Point ของท่านคงเหลือไม่เพียงพอ' }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.users.update({
                where: { discordId: decoded.discordId },
                data: { point: { decrement: product[0].price } }
            }),

            prisma.history.createMany({
                data: {
                    name: product[0].name,
                    discount: null,
                    userId: user.id,
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
