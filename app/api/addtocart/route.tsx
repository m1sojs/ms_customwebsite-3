import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

type CartItem = {
  name: string;
  monthly: string;
};

interface itemExist {
    name: string,
    monthly: string,
}

function isCartItemArray(value: unknown): value is CartItem[] {
  return Array.isArray(value) && value.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'name' in item &&
    'monthly' in item
  );
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const { name, monthly } = await request.json();

    if (!token) {
        return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, secret) as { discordId: string };
        const user = await prisma.users.findUnique({ where: { discordId: decoded.discordId } });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
        }

        const cartRaw = user.cart;
        const cart: CartItem[] = isCartItemArray(cartRaw) ? cartRaw : [];

        const existingIndex = cart.findIndex((item: itemExist) => item.name === name);

        if (existingIndex !== -1) {
            return NextResponse.json({ message: 'คุณมีสินค้านี้ในตะกร้าเรียบร้อยแล้ว' }, { status: 404 });
        } else {
            cart.push({ name, monthly });
        }

        const updatedUser = await prisma.users.update({
            where: { discordId: decoded.discordId },
            data: { cart },
        });

        return NextResponse.json(updatedUser, { status: 200 });

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
