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
    const decoded = jwt.verify(token, secret) as { discordId: string; };

    const userCart = await prisma.users.findUnique({
      where: { discordId: decoded.discordId },
      select: { cart: true }
    });

    if (!userCart) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    const rawCart = userCart.cart;
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
        monthlyPrice: true,
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

    return NextResponse.json({ cart: enrichedCart }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 });
  }
}
