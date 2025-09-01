import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { category } = await request.json();
        const products = await prisma.products.findMany({
            where: { category: category },
            select: {
                id: true,
                label: true,
                name: true,
                image: true,
                stock: true,
                buyedCount: true,
                isNew: true
            }
        });

        if (!products) {
            return NextResponse.json({ message: 'ไม่พบสินค้าในหมวดหมู่' }, { status: 404 });
        }

        return NextResponse.json({ products }, { status: 200 });
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
