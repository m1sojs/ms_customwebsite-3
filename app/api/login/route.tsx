import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from "@/lib/prisma";

interface DiscordUser {
  id: string;
  global_name: string;
  email: string;
}

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await request.json();
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const discordResponse = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!discordResponse.ok) {
            throw new Error(`Discord API error: ${discordResponse.statusText}`);
        }

        const discord: DiscordUser = await discordResponse.json();

        const user = await prisma.users.findUnique({
            where: { discordId: discord.id },
        });

        if (!user) {
            await prisma.users.create({
                data: {
                    discordId: discord.id,
                    email: discord.email,
                    username: discord.global_name,
                    cart: {}
                },
            });
        }

        const token = jwt.sign(
            { token: accessToken, discordId: discord.id },
            secret,
            { expiresIn: '7d' }
        );

        (await cookies()).set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({ message: 'เข้าสู่ระบบเรียบร้อย' });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message || "An error occurred" },
            { status: 500 }
        );
    }
}
