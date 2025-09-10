"use client"

import React, { useEffect, useState } from "react";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import 'aos/dist/aos.css';
import AOS from 'aos';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from "rehype-raw";
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useParams } from "next/navigation";
import websiteConfig from "@/lib/websiteConfig";
import { msAsk } from "@/components/msAsk";

interface ProductInterface {
  id: number;
  label: string;
  name: string;
  price: number;
  monthlyPrice: number;
  promotionPercent: number;
  image: string;
  video: string;
  description: string;
  stock: number;
  buyedCount: number;
  isNew: number;
}

export default function Product() {
  const { product } = useParams() as { product: string };
  const [buymodeSeleted, setBuyModeSeleted] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [productData, setProductData] = useState<ProductInterface[]>([]);

  useEffect(() => {
    Loading.init({ svgColor: websiteConfig.themeColor });
    Report.init({ fontFamily: "Prompt" });

    AOS.init({
      duration: 1000,
      once: true,
    });

    const auth = async () => {
      const res = await fetch("/api/auth");
      if (!res.ok) return location.href = "" + websiteConfig.loginAPI + "";;
    }

    auth()
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      Loading.pulse("");
      try {
        const result = await fetch('/api/getproduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product: product
          })
        });
        if (!result.ok) return;
        const data = await result.json();

        setProductData([data.product]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          Loading.remove();
        }, 1000)
      }
    };

    getProduct();
  }, [product]);

  const handleAddToCart = async () => {
    if (buymodeSeleted) {
      const res = await fetch('/api/addtocart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: productData[0]?.name,
          monthly: monthly
        })
      });

      const data = await res.json();

      if (!res.ok) Report.failure("ตรวจสอบผิดพลาด", data.message || "เกิดข้อผิดพลาด", "ย้อนกลับ");

      window.dispatchEvent(new Event("login-success"));
      Report.success(
        "เสร็จสิ้น",
        `เพิ่มสินค้าเข้าตะกร้าเรียบร้อยแล้ว`,
        "ย้อนกลับ"
      );
    } else {
      Report.failure("ตรวจสอบผิดพลาด", "กรุณาเลือกรูปแบบที่ต้องการสั่งซื้อก่อน", "ย้อนกลับ")
    };
  };

  const handlePaynow = async () => {
    if (buymodeSeleted) {
      msAsk.show({
        bgColor: "bg-white/4 backdrop-blur-md",
        text: `ราคาสินค้าคือ ${monthly ? productData[0]?.monthlyPrice + "/เดือน" : (productData[0]?.promotionPercent > 0 ? (productData[0]?.price - (productData[0]?.promotionPercent / 100 * productData[0]?.price)) : productData[0]?.price)}฿ ต้องการชำระเงินเลยหรือไม่`,
        image: "/dollar-symbol.png",
        placeholder: "โค้ดส่วนลด",
        secondaryButtonStyle: "bg-white text-black font-prompt",
        secondaryButtonText: "กลับ",
        primaryButtonStyle: "bg-[var(--theme-color)] text-white font-prompt",
        primaryButtonText: "ชำระเงิน"
      }).onNext(async (inputValue) => {
        Loading.pulse("Checking Out . . .");
        try {
          const res = await fetch('/api/paynow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: productData[0]?.name,
              monthly: monthly,
              code: inputValue
            })
          });

          const data = await res.json();

          if (!res.ok) Report.failure("ตรวจสอบผิดพลาด", data.message || "เกิดข้อผิดพลาด", "ย้อนกลับ");
          window.dispatchEvent(new Event("login-success"));
          Report.success(
            "เสร็จสิ้น",
            "ซื้อสินค้าเรียบร้อยแล้วสามารถดูสินค้าได้ที่ โปรไฟล์",
            "ย้อนกลับ"
          );
        } catch (error) {
          console.error("Error cancel pay cart:", error);
        } finally {
          setTimeout(() => Loading.remove(), 1000);
        }
      });
    } else {
      Report.failure("ตรวจสอบผิดพลาด", "กรุณาเลือกรูปแบบที่ต้องการสั่งซื้อก่อน", "ย้อนกลับ")
    };
  };

  return (
    <div data-aos="fade-up" className="grid grid-rows-[20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-5 sm:p-20 font-[family-name:var(--font-prompt)]">
      <div className="flex flex-col sm:flex-row text-center mt-40">
        <span className="font-bold text-white text-4xl">{productData[0]?.label}</span>
      </div>

      <div className="flex w-[640px] h-[360px] bg-white/4 rounded-xl backdrop-blur-md mt-25 overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${productData[0]?.video.split("v=")[1].split("&")[0]}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="flex flex-col w-[640px] min-h-[120px] p-4 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
        <span className="font-bold text-xl text-white">รายละเอียดสินค้า</span>
        <div className="prose prose-invert p-4 mt-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {productData[0]?.description}
          </ReactMarkdown>
        </div>
      </div>

      <div className="flex w-[640px] min-h-[120px] p-4 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
        <div className="flex justify-between flex-col gap-2">
          <span className="font-bold text-xl text-white bg-clip-text">
            {productData[0]?.label}
          </span>
          <div className="flex gap-4 items-center text-white font-prompt">
            { productData[0]?.monthlyPrice > 0 &&
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  value="monthly"
                  onClick={() => {
                    setMonthly(true);
                    setBuyModeSeleted(true);
                  }}
                  className="appearance-none w-4 h-4 rounded-full border border-white checked:bg-[#ff6161] checked:border-white transition duration-200"
                />
                รายเดือน
              </label>
            }
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="productType"
                value="lifetime"
                onClick={() => {
                  setMonthly(false);
                  setBuyModeSeleted(true);
                }}
                className="appearance-none w-4 h-4 rounded-full border border-white checked:bg-[#ff6161] checked:border-white transition duration-200"
              />
              ถาวร
            </label>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between ml-auto gap-2">
          <span className="font-bold text-xl text-white bg-clip-text">
            {monthly ? <span>{productData[0]?.monthlyPrice.toLocaleString()}฿</span> : (productData[0]?.promotionPercent > 0 ? <span>{productData[0]?.price - (productData[0]?.promotionPercent / 100 * productData[0]?.price)}฿ <span className="text-gray-500 text-sm line-through">{productData[0]?.price}฿</span></span> : <>{productData[0]?.price}฿</>)} <span className="text-xs text-gray-400">{monthly && "/เดือน"}</span>
          </span>
          <div className="flex gap-2">
            <div onClick={handleAddToCart} className="flex items-center justify-center w-fit text-white bg-white/4 hover:bg-[#cd0101]/60 border border-white/3 backdrop-blur-md overflow-hidden p-2 px-4 gap-2 rounded-md font-prompt duration-300 cursor-pointer">
              ใส่ตะกร้า
            </div>
            <div onClick={handlePaynow} className="flex items-center justify-center w-fit text-white bg-gradient-to-r from-[#ff6161] to-[#cd0101] backdrop-blur-md overflow-hidden p-2 px-4 gap-2 rounded-md font-prompt duration-300 cursor-pointer">
              ซื้อเลย
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
