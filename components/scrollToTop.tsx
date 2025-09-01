"use client"

import React, { useState, useEffect } from "react";

export default function ScrollToTop() {
    const [toTopButton, setToTopButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            console.log("ScrollY:", window.scrollY);
            setToTopButton(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div
            onClick={handleClick}
            className={`fixed bottom-4 right-4 bg-[#323232cc] text-white px-4 py-2 rounded-xl shadow-md cursor-pointer transition-opacity duration-300 ${
                toTopButton ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            Scroll to top
        </div>
    );
}
