import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

type CartItem = {
  name: string;
  monthly: string;
};

function isCartItemArray(value: unknown): value is CartItem[] {
  return Array.isArray(value) && value.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'name' in item
  );
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const { name } = await request.json();

  if (!token) {
    return NextResponse.json({ message: 'ยังไม่ได้เข้าสู่ระบบ' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, secret) as { discordId: string };
    const user = await prisma.users.findUnique({
      where: { discordId: decoded.discordId },
      select: { cart: true },
    });

    if (!user || !isCartItemArray(user.cart)) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้หรือ cart ว่าง' }, { status: 404 });
    }

    const updatedCart = user.cart.filter((item: CartItem) => !(item.name === name));

    await prisma.users.update({
      where: { discordId: decoded.discordId },
      data: { cart: updatedCart },
    });

    const rawCart = updatedCart;
    const cart: CartItem[] = isCartItemArray(rawCart) ? rawCart : [];

    const productNames = [...new Set(cart.map(item => item.name))];

    const products = await prisma.products.findMany({
      where: {
        name: { in: productNames }
      },
      select: {
        label: true,
        name: true,
        price: true,
        image: true
      }
    });

    const enrichedCart = cart.map(item => {
      const product = products.find(p => p.name === item.name);
      return {
        ...item,
        ...product
      };
    });

    return NextResponse.json({ message: 'ลบสำเร็จ', cart: enrichedCart });
  } catch (error) {
    return NextResponse.json({ message: 'เกิดข้อผิดพลาด', error }, { status: 500 });
  }
}
