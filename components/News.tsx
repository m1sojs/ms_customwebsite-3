'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';
import Link from 'next/link';

export default function News() {
    const [hovered, setHovered] = useState(false);
    const [fadeHovered, setFadeHovered] = useState(false);
    const [visible, setVisible] = useState(false);
    const [fadeVisible, setFadeVisible] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });

        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }, 500);

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = '';
        }
    }, [visible]);

    const handleHideNews = () => {
        setFadeVisible(true);
        setTimeout(() => {
            setVisible(true);
        }, 150);
    };

    const handleHoverNews = (active: boolean) => {
        if (active) {
            setFadeHovered(true);
            setHovered(true);
        } else {
            setFadeHovered(false);
            setTimeout(() => {
                setHovered(false);
            }, 150);
        }
    };

    return (
        <>
            {!visible && (
                <div
                    className={`absolute z-999 w-full h-full bg-[#00000066] flex items-center justify-center ${fadeVisible ? 'fade-out' : 'fade-in'}`}
                    onClick={handleHideNews}
                >
                    <div
                        onMouseEnter={() => handleHoverNews(true)}
                        onMouseLeave={() => handleHoverNews(false)}
                        className="relative"
                    >
                        <div className="relative w-[340px] h-[475px] overflow-hidden">
                            <Image
                                data-aos="fade-down"
                                className="group object-contain"
                                src="/news_1.png"
                                fill
                                alt="#"
                            />
                        </div>
                        {hovered && (
                            <Link href="/store" className={`absolute top-0 left-0 flex items-center justify-center text-white bg-[#00000066] w-[340px] h-[475px] font-prompt hover:cursor-pointer transition-opacity duration-300 ${fadeHovered ? 'opacity-100' : 'opacity-0'}`}>
                                รายระเอียด
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
