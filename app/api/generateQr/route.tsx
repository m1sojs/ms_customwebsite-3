import generatePayload from "promptpay-qr";
import { toDataURL } from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { loadConfigFromAPI } from "@/lib/websiteConfig";

function getRandomAmountString(amount: number): string {
  const randomTwoDigit = Math.floor(Math.random() * 90) + 10;
  return `${amount}.${randomTwoDigit}`;
}

export async function POST(request: NextRequest) {
  try {
    const config = await loadConfigFromAPI();
    const promptPayId = config.promptPayID;
    const body = await request.json();
    const { amount } = body;

    const randomEndAmount = parseFloat(getRandomAmountString(amount));

    const payload = generatePayload(promptPayId, { amount: randomEndAmount });

    const qrImage = await toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 10,
      color: {
        dark: '#ff00000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({ image: qrImage, newAmount: randomEndAmount });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred" },
      { status: 500 }
    );
  }
}
