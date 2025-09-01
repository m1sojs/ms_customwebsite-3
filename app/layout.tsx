import type { Metadata } from "next";
import { Poppins, Prompt } from "next/font/google";
import News from "@/components/News"
import "./globals.css";
import HeaderBar from "@/components/headerBar";
import ThemeProvider from "@/components/themeProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "400"
});

const poppinsBold = Poppins({
  variable: "--font-poppins-bold",
  subsets: ["latin"],
  weight: "800"
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "Cgxlion Studio",
  description: "Fivem's Resource Store",
  keywords: ["Fivem", "Resource Store", "Gaming", "Cgxlion Studio"],
  metadataBase: new URL("https://store.memorious.online"),
  openGraph: {
    title: "Cgxlion Studio",
    description: "Cgxlion Studio - Fivem's Resource Store สคริปต์ดี ราคาถูก ที่นี่ที่เดียว",
    url: "https://store.memorious.online",
    siteName: 'Cgxlion Studio',
    images: [
      {
        url: 'https://api.memorious.online/images/webfontimage.png',
        width: 1200,
        height: 630,
        alt: "Cgxlion Studio Cover"
      }
    ],
    type: "website"
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppinsBold.variable} ${prompt.variable} antialiased`}>
        <ThemeProvider>
          <HeaderBar />
          <News />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
