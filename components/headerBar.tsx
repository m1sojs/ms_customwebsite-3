'use client'

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faCoins, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/navigation";
import websiteConfig from "@/lib/websiteConfig";

export default function HeaderBar() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [discordId, setDiscordId] = useState<string | null>(null);
    const [discordAvatar, setDiscordAvatar] = useState<string | null>(null);
    const [discordName, setDiscordName] = useState<string | null>(null);
    const [cartLenght, setCartLenght] = useState<number | null>(null);
    const [point, setPoint] = useState<number | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const initializeAndFetch = async () => {
            try {
                const res = await fetch('/api/me', {
                    credentials: 'include',
                });
                if (!res.ok) return;
                const data = await res.json();

                setIsLogin(true);
                setDiscordId(data.id);
                setDiscordAvatar(data.avatar);
                setDiscordName(data.global_name);
                setCartLenght(data.cart.length);
                setPoint(data.point);
            } catch (error) {
                console.error("Error handling user data:", error);
            }
        };

        initializeAndFetch();

        const handleLoginSuccess = () => {
            initializeAndFetch();
        };

        window.addEventListener("login-success", handleLoginSuccess);

        return () => {
            window.removeEventListener("login-success", handleLoginSuccess);
        };
    }, []);

    const handleClickLogin = () => {
        location.href = "" + websiteConfig.loginAPI + "";
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/logout');

            router.push('/')
            setTimeout(() => {
                location.reload();
            }, 500);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const toggleProfileDropdown = () => {
        setIsProfileOpen(prev => !prev);
    };

    const toggleMenuDropdown = () => {
        setIsMenuOpen(prev => !prev);
    };

    return (
        <div className="fixed z-999 flex justify-between items-center text-white w-full p-10 font-[family-name:var(--font-poppins)]">
            <div className="flex gap-3 items-center bg-white/4 border border-white/3 backdrop-blur-md p-2 px-4 rounded-xl shadow-lg">
                <Link href="/"><Image src="/mainlogo.png" width={50} height={50} alt="logo" className="rounded-xl" /></Link>
                <div className="grid leading-tight">
                    <span className="hidden sm:flex">CgxLion Studio</span>
                    <span className="hidden sm:flex text-xs text-gray-400">Fivem&apos;s Resource Store</span>
                </div>
            </div>

            <div className="flex gap-5 items-center bg-white/4 border border-white/3 backdrop-blur-md p-2 px-4 rounded-xl shadow-lg">
                <Link href="/" className="text-gray-200 hover:text-gray-500 duration-150 hover:cursor-pointer hidden md:flex font-prompt">หน้าหลัก</Link>
                <Link href="/store" className="text-gray-200 hover:text-gray-500 duration-150 hover:cursor-pointer hidden md:flex font-prompt">สินค้าทั้งหมด</Link>
                <Link href="/cart" className="items-center text-gray-200 hover:text-gray-500 duration-150 hover:cursor-pointer hidden md:flex font-prompt">
                    ตะกร้าสินค้า <div className="min-w-[20px] w-auto h-[20px] px-1 ml-1 bg-[#cd0101]/60 rounded-full text-xs flex items-center justify-center">{isLogin && cartLenght ? cartLenght : 0}</div>
                </Link>
                <div className="grid leading-tight">
                    <div className="md:hidden" onClick={toggleMenuDropdown}>
                        <FontAwesomeIcon icon={faEllipsis} className={`text-white hover:text-gray-500 text-xl duration-150 cursor-pointer`} />
                    </div>

                    {isMenuOpen && (
                        <div className={`absolute mt-12 ml-[-65px] w-[150px] bg-[#32323266] rounded-lg shadow-lg z-10`}>
                            <ul className="flex flex-col py-1 text-sm text-gray-200">
                                <Link href="/" className="px-4 py-2 text-gray-200 hover:text-gray-500 duration-150 cursor-pointer font-prompt">หน้าหลัก</Link>
                                <Link href="/store" className="px-4 py-2 text-gray-200 hover:text-gray-500 duration-150 cursor-pointer font-prompt">สินค้าทั้งหมด</Link>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="bg-gray-500 w-0.5 h-5"></div>

                {isLogin == true ?
                    <>
                        {/* Profile */}
                        <div className="relative">
                            <div
                                className="flex items-center bg-white/1 border border-white/3 backdrop-blur-md hover:bg-[#cd0101]/60 px-3 py-2 gap-2 rounded-xl transition-all duration-150 hover:cursor-pointer"
                                onClick={toggleProfileDropdown}
                            >
                                {discordAvatar ? (
                                    <Image src={`https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.jpg`} width={25} height={25} alt="profile" className="rounded-full" />
                                ) : (
                                    <Image src="/profile.png" width={25} height={25} alt="profile" className="rounded-full" />
                                )}

                                <div className="grid leading-tight">
                                    <span className="text-xs">{discordName}</span>
                                    <span className="text-xs text-gray-400"><FontAwesomeIcon icon={faCoins} className={`text-gray-500 text-xs duration-150 cursor-pointer`} /> {point?.toLocaleString()}</span>
                                </div>

                                <FontAwesomeIcon
                                    icon={faAngleDown}
                                    className={`text-gray-400 text-xs transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : 'rotate-0'}`}
                                />
                            </div>

                            <div
                                className={`absolute mt-2 rounded-lg shadow-lg bg-white/4 border border-white/3 backdrop-blur-md transform transition-all duration-200 ease-out origin-top
        ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                            >
                                <ul className="flex flex-col py-1 text-sm text-gray-200 font-prompt">
                                    <Link href="/profile" className="px-4 py-2 hover:text-gray-500 duration-150 cursor-pointer" onClick={toggleProfileDropdown}>โปรไฟล์</Link>
                                    <Link href="/topup" className="px-4 py-2 hover:text-gray-500 duration-150 cursor-pointer" onClick={toggleProfileDropdown}>เติมเงิน</Link>
                                    <li className="px-4 py-2 hover:text-red-500 duration-150 cursor-pointer" onClick={handleLogout}>ออกจากระบบ</li>
                                </ul>
                            </div>
                        </div>
                    </>
                    :
                    <>
                        <div className="flex items-center bg-[#32323266] hover:bg-[#5865F266] px-5 py-2 gap-2 rounded-xl duration-150 hover:cursor-pointer" onClick={handleClickLogin}>
                            <Image src="/discord.png" width={15} height={15} alt="login" />
                            <span>Login</span>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}
