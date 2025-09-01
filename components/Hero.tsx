import Link from "next/link";
import Image from "next/image";
import CodeTyper from "./codeTyping";

export default function Hero() {
    const discordLink = process.env.NEXT_PUBLIC_DISCORD_LINK

    const handleClickContect = () => {
        window.open(discordLink, "_blank");
    };

    return (
        <div className="lg:flex gap-10 mt-20 sm:mt-40">
            <div className="w-auto sm:w-[500px]">
                <CodeTyper />
            </div>

            <div className="leading-tight h-auto mt-5">
                <span className="text-6xl bg-gradient-to-r from-[#ff6161] to-[#cd0101] bg-clip-text text-transparent font-bold">
                    CgxLion
                </span>

                <div className="flex items-center gap-4">
                    <span className="text-4xl text-white font-bold">Studio /</span>
                    <span className="text-gray-400 font-[family-name:var(--font-prompt)] w-[190px]">
                        สคริปต์คุณภาพ ราคาถูก ลื่นไหล ซัพพอร์ตตลอดต้องที่นี่ที่เดียว
                    </span>
                </div>

                <div className="flex mt-5 gap-5">
                    <div className="flex items-center text-white bg-[#323232]/60 hover:bg-[#5865F2]/60 px-5 py-2 gap-2 rounded-xl duration-150 hover:cursor-pointer" onClick={handleClickContect}>
                        <Image src="/discord.png" width={15} height={15} alt="centect" />
                        <span className="text-sm">Contect Us</span>
                    </div>

                    <Link href="/products" className="flex items-center text-white bg-[#323232]/60 hover:bg-[#ff6161]/60 px-5 py-2 gap-2 rounded-xl duration-150 hover:cursor-pointer" >
                        <Image src="/bucket.png" width={20} height={20} alt="products" />
                        <span className="text-sm">Products</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}