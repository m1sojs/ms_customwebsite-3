import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const category = await prisma.category.findMany();

        if (category.length === 0) {
            return NextResponse.json({ message: 'ไม่พบหมวดหมู่' }, { status: 404 });
        }

        return NextResponse.json({ category }, { status: 200 });
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
