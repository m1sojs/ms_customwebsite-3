import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ message: "กรุณาล็อคอินก่อน" }, { status: 401 });
        return NextResponse.json({ message: "ล็อคอินเรียบร้อยแล้ว" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "เกิดข้อผิดพลาด" },
            { status: 500 }
        );
    }
}
