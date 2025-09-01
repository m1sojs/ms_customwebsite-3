import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

interface DiscordUser {
  id: string;
  global_name: string;
  email: string;
  avatar: string;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  if (!token) {
    return NextResponse.json({ message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, secret) as { discordId: string; token: string };
    const user = await prisma.users.findUnique({ where: { discordId: decoded.discordId }})

    const discordResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${decoded.token}`,
      },
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord API error: ${discordResponse.statusText}`);
    }

    const discord: DiscordUser = await discordResponse.json();

    return NextResponse.json({
      id: discord.id,
      avatar: discord.avatar,
      email: discord.email,
      global_name: discord.global_name,
      cart: user?.cart,
      point: user?.point
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred" },
      { status: 500 }
    );
  }
}
