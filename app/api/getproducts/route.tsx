import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { category } = await request.json();

        if (category) {
            const products = await prisma.products.findMany({
                where: { category: category },
                select: {
                    id: true,
                    label: true,
                    name: true,
                    price: true,
                    monthlyPrice: true,
                    image: true,
                    stock: true,
                    buyedCount: true,
                    isNew: true,
                    hidden: true,
                    promotionPercent: true
                }
            });

            if (!products) {
                return NextResponse.json({ message: 'ไม่พบสินค้าในหมวดหมู่' }, { status: 404 });
            }
            return NextResponse.json({ products }, { status: 200 });
        } else {
            const products = await prisma.products.findMany({
                select: {
                    id: true,
                    label: true,
                    name: true,
                    image: true,
                    price: true,
                    category: true,
                    isNew: true,
                    buyedCount: true,
                    hidden: true
                },
                orderBy: {
                    buyedCount: 'desc',
                },
                take: 3,
            });

            if (!products || products.length === 0) {
                return NextResponse.json({ message: 'สินค้าในคลังว่างเปล่า' }, { status: 404 });
            }

            return NextResponse.json({ products }, { status: 200 });
        }
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
