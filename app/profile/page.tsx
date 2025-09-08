"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faBan, faCoins, faDownload, faKey, faPen, faRotate } from "@fortawesome/free-solid-svg-icons";
import { msConfirm } from "@/components/msConfirm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { msAsk } from "@/components/msAsk";
import websiteConfig from "@/lib/websiteConfig";

interface HistoryInterface {
  id: number;
  name: string;
  label: string;
  discount: string;
  image: string;
  ip: string;
  tokenKey: string;
  price: number;
  downloadLink: string;
  version: string;
  latestVersion: string;
  expire: string;
  suspended: boolean;
  createdAt: string;
}

interface TopupHistoryInterface {
  refNo: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

function isIPv4(input: string): boolean {
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return ipv4Regex.test(input);
}

export default function Profile() {
  const [page, setPage] = useState("scripts");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryInterface[]>([]);
  const [topupHistory, setTopupHistory] = useState<TopupHistoryInterface[]>([]);
  const [userData, setUserData] = useState({ id: "", avatar: "", username: "", email: "", point: 0 });

  useEffect(() => {
    Loading.init({
      svgColor: websiteConfig.themeColor,
    });

    Report.init({
      fontFamily: "Prompt"
    })

    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const getUserProfile = async () => {
      Loading.pulse("Loading . . .");
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        updataHistory();
        setUserData({ id: data.id, avatar: data.avatar, username: data.global_name, email: data.email, point: data.point });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          Loading.remove();
        }, 1000)
      }
    };

    getUserProfile();
  }, []);

  const updataHistory = async () => {
    const res = await fetch('/api/gethistory');
    if (!res.ok) throw new Error("Failed to fetch user data");
    const data = await res.json();
    setHistory(data.history);
    setTopupHistory(data.topupHistory);
  }

  const handleChangeIP = async (id: number, name: string, newip: string) => {
    const res = await fetch('/api/changeip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        name: name,
        newIP: newip
      })
    });

    const data = await res.json();

    if (!res.ok) Report.failure("ตรวจสอบผิดพลาด", data.message || "เกิดข้อผิดพลาด", "ย้อนกลับ");

    updataHistory();
    Report.success("เสร็จสิ้น", "แก้ไขไอพีเรียบร้อยแล้ว", "ย้อนกลับ");
  }

  const handleTokenReset = async (id: number, name: string) => {
    const res = await fetch('/api/tokenreset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        name: name
      })
    });

    const data = await res.json();

    if (!res.ok) Report.failure("ตรวจสอบผิดพลาด", data.message || "เกิดข้อผิดพลาด", "ย้อนกลับ");

    updataHistory();
    Report.success("เสร็จสิ้น", "รีเซ็ตเรียบร้อยแล้ว", "ย้อนกลับ");
  }

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const handleDownload = async (id: number, name: string, link: string) => {
    location.href = "" + link + "";
    console.log(id)
    const res = await fetch('/api/updateversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        name
      })
    });
    if (!res.ok) throw new Error("Failed to update user product version");
    updataHistory();
  }

  return (
    <div data-aos="fade-up" className="flex flex-col items-center w-full min-h-screen p-8 sm:p-15 font-[family-name:var(--font-prompt)]">
      <div className="flex flex-col w-[960px] min-h-[120px] p-8 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden mt-20">
        <span className="flex items-center gap-8 font-bold text-xl text-white bg-clip-text">
          {userData.avatar ? (
            <div className="relative w-[128px] h-[128px]">
              <Image src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.jpg`} fill alt="profile" className="object-contain rounded-full" />
            </div>
          ) : (
            <Image src="/profile.png" width={25} height={25} alt="profile" className="rounded-full" />
          )}
          <span className="flex flex-col gap-1">
            <span>{userData.username}</span>
            <span>{userData.email}</span>
            <span className="text-gray-400 text-sm"><FontAwesomeIcon icon={faCoins} className={`text-gray-500 duration-150 cursor-pointer`} /> {userData.point.toLocaleString()}</span>
          </span>
        </span>
        <div className="flex text-white gap-2 ml-4 mt-8">
          <span onClick={() => setPage("scripts")} className="bg-white/4 rounded-t-xl backdrop-blur-md p-2 px-4 hover:bg-red-600/60 duration-300 cursor-pointer">รายการสคริปต์</span>
          <span onClick={() => setPage("history")} className="bg-white/4 rounded-t-xl backdrop-blur-md p-2 px-4 hover:bg-red-600/60 duration-300 cursor-pointer">ประวัติการซื้อสินค้า</span>
          <span onClick={() => setPage("topuphistory")} className="bg-white/4 rounded-t-xl backdrop-blur-md p-2 px-4 hover:bg-red-600/60 duration-300 cursor-pointer">ประวัติการเติมเงิน</span>
        </div>
        {page === "scripts" && (
          <div className="flex flex-col w-full min-h-[120px] p-4 gap-2 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
            {history.length > 0 && (
              <div className="grid grid-cols-6 w-full p-2 bg-white/10 rounded-lg border border-white/20 text-sm sm:text-base font-semibold">
                <span className="text-center">สินค้า</span>
                <span className="text-center">ไอพีเซิฟเวอร์</span>
                <span className="text-center">จะหมดอายุในอีก</span>
                <span className="text-center">เวอร์ชั่น</span>
                <span className="flex items-center justify-center gap-2">คีย์<FontAwesomeIcon icon={faKey} className="text-gray-500 hover:text-[var(--theme-color)] text-xs duration-150 cursor-pointer" /></span>
                <span className="text-center">จัดการ</span>
              </div>
            )}

            {history.length === 0 ? (
              <>ไม่พบประวัติการซื้อสินค้า</>
            ) : (
              history.map((value, index) => (
                <div key={index} className="grid grid-cols-6 w-full p-2 bg-white/4 border-white/20 rounded-lg text-sm sm:text-base">
                  <span className="text-center hover:underline cursor-pointer">{value.label}</span>

                  <span className="text-center">
                    {value.suspended ? (
                      <span className="text-red-400">สินค้าถูกระงับ</span>
                    ) : (
                      <>
                        {value.ip}{" "}
                        <FontAwesomeIcon
                          onClick={() => {
                            msAsk
                              .show({
                                bgColor: "bg-white/4 backdrop-blur-md",
                                headerText: "อัพเดท IP Server",
                                text: `หลังจากแก้ไขแล้วจะไม่สามารถเปลี่ยนแปลงได้เป็นเวลา 1ชั่วโมง`,
                                placeholder: "ระบุหมายเลข IP เซิร์ฟเวอร์ในรูปแบบ IPv4",
                                secondaryButtonStyle: "bg-white text-black font-prompt",
                                secondaryButtonText: "กลับ",
                                primaryButtonStyle: "bg-[var(--theme-color)] text-white font-prompt",
                                primaryButtonText: "เปลี่ยนเลย",
                              })
                              .onNext(async (inputValue) => {
                                Loading.pulse("Changing IP . . .");
                                try {
                                  if (isIPv4(inputValue)) {
                                    handleChangeIP(value.id, value.name, inputValue);
                                  } else {
                                    Report.failure(
                                      "ตรวจสอบผิดพลาด",
                                      "กรุณาระบุหมายเลข IP เซิร์ฟเวอร์ในรูปแบบ IPv4 เท่านั้น",
                                      "ย้อนกลับ"
                                    );
                                  }
                                } catch (error) {
                                  console.error("Error:", error);
                                } finally {
                                  setTimeout(() => Loading.remove(), 1000);
                                }
                              });
                          }}
                          icon={faPen}
                          className="text-gray-500 text-xs duration-150 cursor-pointer"
                        />
                      </>
                    )}
                  </span>

                  <span className="text-center">
                    {value.expire
                      ? `${Math.max(
                        0,
                        Math.ceil(
                          (new Date(value.expire).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                        )
                      )} วัน`
                      : "-"}
                  </span>
                  <span className="text-center">
                    {value.version}{" "}
                    {value.latestVersion != value.version && <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faArrowDown}
                            className="text-red-400 hover:text-[var(--theme-color)] text-xs duration-150 cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>เวอร์ชั่นของคุณเก่าแล้ว</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>}
                  </span>
                  {value.suspended ?
                    <span className="text-center text-red-400">สินค้าถูกระงับ</span>
                    :
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span onClick={() => handleCopy(value.tokenKey)} className="flex items-center justify-center text-xs relative group">
                            <span className="blur-sm select-none group-hover:blur-none cursor-pointer transition duration-300">
                              {value.tokenKey}
                            </span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? "ก็อปปี้แล้ว!" : "คลิกเพื่อก็อปปี้"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  }
                  <span className="flex items-center justify-center gap-2">
                    {value.suspended ?
                      <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FontAwesomeIcon
                                icon={faBan}
                                className="text-gray-500 hover:text-[var(--theme-color)] text-xs duration-150 cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>สินค้าถูกระงับ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      :
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FontAwesomeIcon
                                icon={faDownload}
                                className="text-gray-500 hover:text-[var(--theme-color)] text-xs duration-150 cursor-pointer"
                                onClick={() => handleDownload(value.id, value.name, value.downloadLink)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>คลิกเพื่อดาวโหลด</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FontAwesomeIcon
                                icon={faRotate}
                                className="text-gray-500 hover:text-[var(--theme-color)] text-xs duration-150 cursor-pointer"
                                onClick={() => {
                                  msConfirm.show({
                                    bgColor: "bg-white/4 backdrop-blur-md",
                                    text: `คุณต้องการรีเซ็ตจริงๆใช้มั้ย (หลังจากรีเซ็ตแล้วจะไม่สามารถรีเซ็ตได้เป็นเวลา 1ชั่วโมง)`,
                                    image: "/question-sign.png",
                                    secondaryButtonStyle: "px-4 text-black font-prompt",
                                    secondaryButtonText: "กลับ",
                                    primaryButtonStyle: "bg-[var(--theme-color)] text-white font-prompt",
                                    primaryButtonText: "รีเซ็ตเลย"
                                  }).onNext(async () => {
                                    Loading.pulse("Reseting Token . . .");
                                    try {
                                      handleTokenReset(value.id, value.name)
                                    } catch (error) {
                                      console.error("Error:", error);
                                    } finally {
                                      setTimeout(() => Loading.remove(), 1000);
                                    }
                                  })
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>คลิกเพื่อรีเซ็ตคีย์</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    }
                  </span>
                </div>
              ))
            )}
          </div>
        )}
        {page === "history" && (
          <div className="flex flex-col w-full min-h-[120px] p-4 gap-2 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
            {history.length > 0 && (
              <div className="grid grid-cols-5 w-full p-2 bg-white/10 rounded-lg border border-white/20 text-sm sm:text-base font-semibold">
                <span className="text-center">สินค้า</span>
                <span className="text-center">ราคา</span>
                <span className="text-center">ส่วนลด</span>
                <span className="text-center">จะหมดอายุในวันที่</span>
                <span className="text-center">ซื้อเมื่อ</span>
              </div>
            )}

            {history.length === 0 ? (
              <>ไม่พบประวัติการซื้อสินค้า</>
            ) : (
              history.map((value, index) => (
                <div key={index} className="grid grid-cols-5 w-full p-2 bg-white/4 border-white/20 rounded-lg text-sm sm:text-base">
                  <span className="text-center hover:underline cursor-pointer">{value.label}</span>
                  <span className="text-center">{value.price.toLocaleString()}฿ </span>
                  <span className="text-center">{value.discount ? value.discount : '-'}</span>
                  <span className="text-center">{value.expire ? new Date(value.expire).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }) : '-'}</span>
                  <span className="text-center">{new Date(value.createdAt).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}</span>
                </div>
              ))
            )}
          </div>
        )}

        {page === "topuphistory" && (
          <div className="flex flex-col w-full min-h-[120px] p-4 gap-2 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
            {history.length > 0 && (
              <div className="grid grid-cols-5 w-full p-2 bg-white/10 rounded-lg border border-white/20 text-sm sm:text-base font-semibold">
                <span className="text-center">รหัสอ้างอิง</span>
                <span className="text-center">จำนวนเงิน</span>
                <span className="text-center">ช่องทาง</span>
                <span className="text-center">สถาณะ</span>
                <span className="text-center">วันที่-เวลาทำรายการ</span>
              </div>
            )}

            {topupHistory.length === 0 ? (
              <>ไม่พบประวัติการเติมเงิน</>
            ) : (
              topupHistory.map((value, index) => (
                <div key={index} className="grid grid-cols-5 w-full p-2 bg-white/4 border-white/20 rounded-lg text-sm sm:text-base">
                  <span className="text-center">{value.refNo}</span>
                  <span className="text-center">{value.amount.toLocaleString()}฿</span>
                  <span className="text-center">{value.method}</span>
                  <span className="text-center">{value.status === "SUCCESS" ? <span className="text-green-400">สำเร็จ</span> : <span className="text-red-400">ไม่สำเร็จ</span>}</span>
                  <span className="text-center">{new Date(value.createdAt).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
