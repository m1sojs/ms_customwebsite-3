"use client"

import React, { useState, useEffect } from "react";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import Image from "next/image";
import 'aos/dist/aos.css';
import AOS from 'aos';
import websiteConfig from "@/lib/websiteConfig";

export default function Topup() {
  const [page, setPage] = useState("promptpay")
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

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
    const getQR = async () => {
      Loading.pulse("Loading . . .");
      try {

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          Loading.remove();
        }, 1000);
      }
    };

    getQR();
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      cancelQr();
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const cancelQr = () => {
    Loading.pulse("Cancelling . . .");
    setIsGenerated(false);
    setQrImage(null);

    const amountInput = document.getElementById("amount") as HTMLInputElement;
    if (amountInput) {
      amountInput.disabled = false;
      amountInput.value = "";
    }

    setCountdown(null);

    setTimeout(() => {
      Loading.remove();
    }, 1000);
  };

  const generateQr = async () => {
    try {
      Loading.pulse("Generating . . .");
      const amountInput = document.getElementById("amount") as HTMLInputElement;
      const amountValue = amountInput?.value;

      if (!amountValue) {
        Loading.remove();
        return;
      }

      setIsGenerated(true);

      const res = await fetch("/api/generateQr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseInt(amountValue),
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setQrImage(data.image);
        setCountdown(600);
        amountInput.value = data.newAmount;
        amountInput.disabled = true;
      }, 1000);

    } finally {
      setTimeout(() => {
        Loading.remove();
      }, 1000);
    }
  };

  return (
    <div data-aos="fade-up" className="flex flex-col items-center min-h-screen p-8 pb-20 sm:p-15 font-[family-name:var(--font-prompt)]">
      <div className="flex items-center m-auto">
        <div className="flex flex-col items-center w-[400px] h-auto text-white bg-white/1 border border-white/3 backdrop-blur-md p-4 rounded-xl duration-150">
          <span className="mt-2 font-prompt">เติมเงิน</span>
          <div className="flex text-white gap-2 mt-8">
            <span onClick={() => setPage("promptpay")} className="bg-white/4 rounded-t-xl backdrop-blur-md p-2 px-4 hover:bg-red-600/60 duration-300 cursor-pointer">สแกนพร้อมเพย์</span>
            <span onClick={() => setPage("twvoucher")} className="bg-white/4 rounded-t-xl backdrop-blur-md p-2 px-4 hover:bg-red-600/60 duration-300 cursor-pointer">ซองของขวัญ</span>
          </div>
          {page === "promptpay" ? (
            <div className="flex flex-col items-center w-full min-h-[120px] p-4 gap-2 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
              <div className="mt-2">
                {qrImage ? (
                  <div className="relative w-[256px] h-[256px]">
                    <Image src={qrImage} fill alt="qrpayment" className="mx-auto object-contain" />
                  </div>
                ) : (
                  <div className="relative w-[256px] h-[256px]">
                    <Image src="/mainlogo.png" alt="#" fill className="rounded-xl object-contain" />
                  </div>
                )}
              </div>
              {countdown !== null && (
                <div className="text-sm text-gray-300 font-prompt mt-2">
                  หมดอายุใน: {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                </div>
              )}
              <input type="number" name="amount" id="amount" placeholder="กรอกจำนวนเงิน" className="bg-white/1 border border-white/4 hover:bg-[#cd0101]/60 outline-none text-sm font-prompt duration-150 w-full p-2 px-5 mt-1 rounded-xl" />
              {isGenerated ? (
                <div className="bg-[#cd010166] hover:bg-[#cd010190] hover:cursor-pointer text-sm text-center duration-150 w-full p-2 rounded-xl font-prompt" onClick={cancelQr}>ยกเลิก</div>
              ) : (
                <div className="bg-white/4 hover:bg-[#cd0101]/60 hover:cursor-pointer text-sm text-center duration-150 w-full p-2 rounded-xl font-prompt" onClick={generateQr}>สร้าง QRCode</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center w-full min-h-[120px] p-4 gap-2 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
              <div className="mt-2">
                <div className="relative w-[400px] h-[210px]">
                  <Image src="/topupvoucher.png" alt="#" fill className="rounded-xl object-contain" />
                </div>
              </div>
              <input type="number" name="amount" id="amount" placeholder="กรอกลิ้งซองของขวัญ" className="bg-white/1 border border-white/4 hover:bg-[#cd0101]/60 outline-none text-sm font-prompt duration-150 w-full p-2 px-5 mt-1 rounded-xl" />
              <div className="bg-white/4 hover:bg-[#cd0101]/60 hover:cursor-pointer text-sm text-center duration-150 w-full p-2 rounded-xl font-prompt" >เติมเงิน</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
