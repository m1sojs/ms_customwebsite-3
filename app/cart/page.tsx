"use client"

import React, { useEffect, useState } from "react";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import {
  faShoppingCart,
  faTrash,
  faCheckCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import 'aos/dist/aos.css';
import AOS from 'aos';
import { msConfirm } from "@/components/msConfirm";
import websiteConfig from "@/lib/websiteConfig";
import Link from "next/link";

interface Cart {
  id: number;
  name: string;
  monthly: boolean;
  price: number;
  monthlyPrice: number;
  promotionPercent: number;
  image: string;
  label: string;
}

export default function Cart() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<Cart[]>([]);
  const [discountCode, setDiscountCode] = useState("")
  const totalPrice = cart.reduce((sum, item) => {
    const product = cart.find(p => p.name === item.name);
    if (!product) return sum;
    return sum + (item.monthly ? (product.monthlyPrice ?? product.price) : (product.promotionPercent > 0 ? (product.price - (product.promotionPercent / 100 * product.price)) : product.price));
  }, 0);

  useEffect(() => {
    Loading.init({ svgColor: websiteConfig.themeColor });
    Report.init({ fontFamily: "Prompt" })

    AOS.init({
      duration: 1000,
      once: true,
    });

    const auth = async () => {
      const res = await fetch("/api/auth");
      if (!res.ok) return location.href = "" + websiteConfig.loginAPI + "";;
    }
    auth();
  }, []);

  useEffect(() => {
    const getCategory = async () => {
      Loading.pulse("Loading . . .");
      try {
        const result = await fetch('/api/getcarts');
        if (!result.ok) return;
        const data = await result.json();
        setCart(data.cart);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          Loading.remove();
        }, 1000)
      }
    };

    getCategory();
  }, []);

  const handlePay = async () => {
    msConfirm.show({
      bgColor: "bg-white/4 backdrop-blur-md",
      text: `ราคาสินค้าทั้งหมดในตะกร้าของคุณคือ ${totalPrice.toLocaleString()}฿ ต้องการชำระเงินเลยหรือไม่`,
      image: "/question-sign.png",
      secondaryButtonStyle: "bg-white text-black font-prompt",
      secondaryButtonText: "กลับ",
      primaryButtonStyle: "bg-[var(--theme-color)] text-white font-prompt",
      primaryButtonText: "ชำระเงิน"
    }).onNext(async () => {
      Loading.pulse("Checking Out . . .");
      try {
        const result = await fetch('/api/paycart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: discountCode
          })
        });
        const data = await result.json();
        if (!result.ok) return Report.failure("เกิดข้อผิดพลาด", data.message, "ตกลง");
        window.dispatchEvent(new Event("login-success"));
        setStep(2)
      } catch (error) {
        console.error("Error cancel pay cart:", error);
      } finally {
        setTimeout(() => Loading.remove(), 1000);
      }
    })
  }

  const handleRemove = async (name: string) => {
    try {
      const res = await fetch('/api/removefromcart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        return Report.failure("เกิดข้อผิดพลาด", data.message, "ตกลง");
      }

      setCart(data.cart);
      window.dispatchEvent(new Event("login-success"));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <div
      data-aos="fade-up"
      className="flex flex-col items-center justify-center w-full min-h-screen p-6 sm:p-12 gap-5 font-[family-name:var(--font-prompt)]"
    >
      <div className="flex flex-col w-[640px] min-h-[400px] p-6 bg-white/5 rounded-xl backdrop-blur-md shadow-xl gap-6 overflow-hidden">
        <span className="font-bold text-xl text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faShoppingCart} />
          {step === 1 && "ตะกร้าสินค้า"}
          {step === 2 && "สำเร็จ"}
        </span>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="cart"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {cart.length === 0 ? (
                <p className="text-center text-gray-300">ตะกร้าว่างเปล่า</p>
              ) : (
                cart.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-[60px] h-[60px] rounded-md overflow-hidden">
                        <Image src={value.image ? value.image : "/product.png"} alt={value.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold">{value.label}</p>
                        <p className="text-sm text-gray-300">{value.monthly ? <span>{value.monthlyPrice.toLocaleString()}฿</span> : (value.promotionPercent > 0 ? <span>{value.price - (value.promotionPercent / 100 * value.price)}฿ <span className="text-gray-500 text-sm line-through">{value.price}฿</span></span> : <>{value.price}฿</>)} <span className="text-xs text-gray-400">{value.monthly && "/เดือน"}</span></p>
                        <p className="text-sm text-gray-300">ประเภท : {value.monthly ? "รายเดือน" : "ถาวร"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(value.name)}
                      className="w-10 h-10 rounded-full text-red-400 hover:bg-red-400/20 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))
              )}

              {cart.length > 0 && (
                <>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">โค้ดส่วนลด</label>
                      <input
                        type="text"
                        placeholder="ใส่โค้ดส่วนลด"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="w-full p-2 px-4 outline-none bg-white/4 rounded-xl border border-white/10 focus:border-[var(--theme-color)] duration-300"
                      />
                    </div>

                    <div className="text-xl font-bold">{`ราคารวม : ${totalPrice.toLocaleString()}฿`}</div>
                  </div>

                  <button
                    onClick={() => handlePay()}
                    className="mt-2 flex items-center justify-center gap-2 bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/70 text-white font-semibold py-2 px-4 rounded-xl duration-300"
                  >
                    ชำระเงิน <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="success"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-4 text-center"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-5xl" />
              <h2 className="text-xl font-bold">ชำระเงินสำเร็จ!</h2>
              <p className="text-gray-300">ขอบคุณสำหรับการสั่งซื้อ 🎉</p>
              <Link
                href={"/profile"}
                className="flex items-center justify-center gap-2 border-2 border-[var(--theme-color)] bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/70 text-white font-semibold py-2 px-4 rounded-xl duration-300"
              >
                <FontAwesomeIcon icon={faShoppingCart} /> ไปที่หน้าประวัติ
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center items-center gap-6 mt-auto">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === 1 ? "border-[var(--theme-color)] text-[var(--theme-color)]" : "border-gray-400 text-gray-400"
              }`}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === 3 ? "border-[var(--theme-color)] text-[var(--theme-color)]" : "border-gray-400 text-gray-400"
              }`}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        </div>
      </div>
    </div>
  );
}