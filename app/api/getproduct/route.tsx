import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { product } = await request.json();
        const result = await prisma.products.findUnique({
            where: { name: product },
        });

        if (!result) {
            return NextResponse.json({ message: 'ไม่พบสินค้า' }, { status: 404 });
        }

        return NextResponse.json({ product: result }, { status: 200 });
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
