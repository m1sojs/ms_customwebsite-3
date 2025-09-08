"use client";

import websiteConfig from "@/lib/websiteConfig";
import Image from "next/image";

export default function Footer() {
    const instagramLink = process.env.NEXT_PUBLIC_INSTAGRAM_LINK
    const discordLink = process.env.NEXT_PUBLIC_DISCORD_LINK
    const tiktokLink = process.env.NEXT_PUBLIC_TIKTOK_LINK

    const handleClickContect = (path: string) => {
        if (path === "discord") {
            window.open(discordLink)
        } else if (path === "instagram") {
            window.open(instagramLink)
        } else if (path === "tiktok") {
            window.open(tiktokLink)
        }
    }

    return (
        <div className="lg:flex gap-10 mt-20 justify-between w-full p-2 bg-white/1 border border-white/3 backdrop-blur-md rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
                <Image src={websiteConfig.websiteLogo ? websiteConfig.websiteLogo : "/mainlogo.png"} width={50} height={50} alt="#"></Image>
                <div className="flex flex-col">
                    <span className="text-white text-sm sm:flex">{websiteConfig.websiteName}</span>
                    <span className="text-gray-400 text-xs sm:flex">Website by memorious studio</span>
                </div>
            </div>

            <footer className="text-gray-300 m-auto text-xs flex gap-2 rounded-lg font-prompt">
                © Copyright all right reserved to <u>{websiteConfig.websiteName}</u>
            </footer>

            <div className="flex flex-col">
                <span className="text-gray-400 text-xs ml-auto mt-auto hidden lg:block">Socials</span>
                <div className="flex gap-3 lg:mt-auto mt-2">
                    <div onClick={() => handleClickContect('discord')} className="bg-[#32323266] hover:bg-[#cd0101]/60 hover:cursor-pointer duration-300 p-2 rounded-xl">
                        <Image src="/discord.png" width={20} height={20} alt="#"></Image>
                    </div>
                    <div onClick={() => handleClickContect('instagram')} className="bg-[#32323266] hover:bg-[#cd0101]/60 hover:cursor-pointer duration-300 p-2 rounded-xl">
                        <Image src="/instagram.png" width={20} height={20} alt="#"></Image>
                    </div>
                    <div onClick={() => handleClickContect('tiktok')} className="bg-[#32323266] hover:bg-[#cd0101]/60 hover:cursor-pointer duration-300 p-2 rounded-xl">
                        <Image src="/tiktok.png" width={20} height={20} alt="#"></Image>
                    </div>
                </div>
            </div>
        </div>
    );
}
