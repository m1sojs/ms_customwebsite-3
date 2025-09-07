"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loading } from "notiflix/build/notiflix-loading-aio";
import "aos/dist/aos.css";
import AOS from "aos";
import Link from "next/link";
import websiteConfig from "@/lib/websiteConfig";

interface Category {
  id: number;
  label: string;
  name: string;
  image: string;
}

export default function Products() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [category, setCategory] = useState<Category[]>([])

  useEffect(() => {
    Loading.init({ svgColor: websiteConfig.themeColor });

    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const getCategory = async () => {
      Loading.pulse("Loading . . .");
      try {
        const result = await fetch('/api/getcategory');
        if (!result.ok) return;
        const formatResult = await result.json();

        setCategory(formatResult.category);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          Loading.remove();
        }, 500);
      }
    };

    getCategory();
  }, []);

  return (
    <div
      data-aos="fade-up"
      className="flex flex-col items-center min-h-screen p-8 sm:p-15 font-[family-name:var(--font-poppins)]"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-30">
        {category.map((value, index) => (
          <Link
            key={index}
            href={`/store/${value.name}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="flex flex-col w-[400px] h-[200px] bg-white/4 border border-white/3 backdrop-blur-md p-2 gap-2 rounded-xl hover:scale-105 duration-300 group"
          >
            <div className="flex items-center justify-center w-full h-full text-white bg-white/4 border border-white/3 backdrop-blur-md overflow-hidden mt-auto p-4 gap-2 rounded-xl font-prompt relative">
              <Image src={value.image} fill alt="category" />
              <div
                className={`flex mt-auto mr-auto transition-opacity duration-300 ease-in-out pointer-events-none ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                } flex items-center justify-center p-1 bg-white/4 border border-white/3 backdrop-blur-md rounded-lg`}
              >
                <span className="text-white font-medium">
                  {value.label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
