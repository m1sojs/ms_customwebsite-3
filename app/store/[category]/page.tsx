"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useParams } from "next/navigation";
import websiteConfig from "@/lib/websiteConfig";

interface ProductInterface {
  id: number;
  label: string;
  price: number;
  name: string;
  image: string;
  stock: number;
  buyedCount: number;
  isNew: number;
  hidden: boolean;
  promotionPercent: number;
  monthlyPrice: number;
}

export default function Category() {
  const { category } = useParams() as { category: string };
  const [products, setProducts] = useState<ProductInterface[]>([]);

  useEffect(() => {
    Loading.init({
      svgColor: websiteConfig.themeColor,
    });

    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      Loading.pulse("Loading . . .");
      try {
        const result = await fetch('/api/getproducts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category: category
          })
        });
        if (!result.ok) return;
        const data = await result.json();

        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          Loading.remove();
        }, 500)
      }
    };

    getProducts();
  }, [category]);

  return (
    <div data-aos="fade-up" className="flex flex-col items-center min-h-screen p-8 sm:p-15 font-[family-name:var(--font-poppins)]">
      <div className="grid items-center grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-4 mt-30">
        {products.length == 0 ?
          <div>ไม่มีสินค้าในคลัง</div>
          :
          products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).map((value, index) => !value.hidden && ( // ✅ render เฉพาะที่ไม่ hidden
            <Link
              key={index}
              href={`/store/${category}/${value.name}`}
              className="flex flex-col w-[320px] h-auto min-h-[240px] bg-white/4 border border-white/3 backdrop-blur-md p-2 gap-2 rounded-xl hover:scale-105 duration-300 transition-all ease-in-out group"
            >
              <div className="flex items-center justify-center w-full h-[240px] bg-white/4 border border-white/3 backdrop-blur-md overflow-hidden mt-auto p-4 gap-2 rounded-xl font-prompt relative">
                <Image
                  src={value.image ? value.image : "/product.png"}
                  fill
                  alt="product"
                  className="object-cover"
                />

                {value.isNew && (
                  <div className="absolute top-2 right-2 z-10 bg-[var(--theme-color)]/60 text-white p-2 rounded-md">
                    New
                  </div>
                )}

                <div className="absolute top-2 left-2 z-10 bg-black/40 p-2 rounded-md">
                  {value.label}
                </div>

                <div className="absolute bottom-2 right-2 z-10 bg-black/40 p-2 rounded-md">
                  {(value.promotionPercent > 0 ? 
                    <span>{value.price - (value.promotionPercent / 100 * value.price)}฿ <span className="text-red-400 text-sm line-through">{value.price}฿</span></span> 
                  : 
                    <>{value.price}฿</>
                  )}
                  <span className="text-xs">{ value.monthlyPrice > 0 && " | " + value.monthlyPrice + "฿/เดือน"}</span>
                </div>
              </div>

              <div className="flex">
                <div className="flex flex-col w-fit text-gray-400 text-xs bg-white/4 border border-white/3 backdrop-blur-md overflow-hidden mt-auto p-2 gap-1 rounded-xl font-prompt duration-300">
                  <span>ยอดการซื้อทั้งหมด: {value.buyedCount}</span>
                  {
                    value.stock === -1 ? <span></span> : <span>สต็อค: {value.stock}</span>
                  }
                </div>
                <div className="flex items-center justify-center w-fit text-white bg-white/4 hover:bg-[#cd0101]/60 border border-white/3 backdrop-blur-md overflow-hidden mt-auto ml-auto p-2 gap-2 rounded-xl font-prompt duration-300">
                  สั่งซื้อสินค้า
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div >
  );
}
