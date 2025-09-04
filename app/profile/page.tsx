"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCoins, faDownload, faKey, faPen, faRotate, faX } from "@fortawesome/free-solid-svg-icons";
import { msConfirm } from "@/components/msConfirm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface HistoryInterface {
  name: string;
  label: string;
  discount: string;
  image: string;
  ip: string;
  tokenKey: string;
  price: number;
  downloadLink: string;
  version: string;
  expire: string;
  createdAt: string;
}

interface TopupHistoryInterface {
  refNo: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export default function Profile() {
  const [page, setPage] = useState("scripts");
  const [copied, setCopied] = useState(false);
  const [editIp, setEditIp] = useState<Record<number, boolean>>({});
  const [history, setHistory] = useState<HistoryInterface[]>([]);
  const [topupHistory, setTopupHistory] = useState<TopupHistoryInterface[]>([]);
  const [userData, setUserData] = useState({ id: "", avatar: "", username: "", email: "", point: 0 });

  useEffect(() => {
    Loading.init({
      svgColor: "#cdff61",
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
        const res2 = await fetch('/api/gethistory');
        const res3 = await fetch('/api/gettopuphistory');
        if (!res.ok && !res2.ok && !res3.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        const data2 = await res2.json();
        const data3 = await res3.json();
        setHistory(data2.history);
        setTopupHistory(data3.topuphistory);
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

  const handleChangeIP = async (name: string, newip: string) => {
    const res = await fetch('/api/changeip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        newIP: newip
      })
    });

    const data = await res.json();

    if (!res.ok) Report.failure("ตรวจสอบผิดพลาด", data.message || "เกิดข้อผิดพลาด", "ย้อนกลับ");

    Report.success("เสร็จสิ้น", "แก้ไขไอพีเรียบร้อยแล้ว", "ย้อนกลับ");
  }

  const handleTokenReset = async (name: string) => {
    const res = await fetch('/api/tokenreset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name
      })
    });

    const data = await res.json();

    if (!res.ok) Report.failure("ตรวจสอบผิดพลาด", data.message || "เกิดข้อผิดพลาด", "ย้อนกลับ");

    Report.success("เสร็จสิ้น", "รีเซ็ตเรียบร้อยแล้ว", "ย้อนกลับ");
  }

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
                  <span className="text-center">{value.label}</span>

                  {editIp[index] ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="ip"
                        id={`ip-${index}`}
                        value={value.ip}
                        placeholder="ไอพีเซิฟเวอร์"
                        className="bg-white/1 border border-white/4 hover:bg-[#cd0101]/60 outline-none text-sm font-prompt duration-150 w-[50%] p-1 px-2 rounded-xl"
                        onChange={(e) => {
                          const newHistory = [...history];
                          newHistory[index].ip = e.target.value;
                          setHistory(newHistory);
                        }}
                      />
                      <FontAwesomeIcon
                        onClick={() => {
                          msConfirm.show({
                            bgColor: "bg-white/4 backdrop-blur-md",
                            text: `คุณต้องการแก้ไขไอพีจริงๆใช้มั้ย (หลังจากแก้ไขแล้วจะไม่สามารถเปลี่ยนแปลงได้เป็นเวลา 1ชั่วโมง)`,
                            image: "/question-sign.png",
                            secondaryButtonStyle: "bg-white text-black font-prompt",
                            secondaryButtonText: "กลับ",
                            primaryButtonStyle: "bg-[var(--theme-color)] text-white font-prompt",
                            primaryButtonText: "เปลี่ยนเลย"
                          }).onNext(async () => {
                            Loading.pulse("Changing IP . . .");
                            try {
                              setEditIp({ ...editIp, [index]: false })
                              handleChangeIP(value.name, history[index].ip)
                            } catch (error) {
                              console.error("Error:", error);
                            } finally {
                              setTimeout(() => Loading.remove(), 1000);
                            }
                          })
                        }}
                        icon={faCheck}
                        className="text-xs duration-150 cursor-pointer"
                      />
                      <FontAwesomeIcon
                        onClick={() => {
                          const newHistory = [...history];
                          newHistory[index].ip = history[index].ip;
                          setHistory(newHistory);
                          setEditIp({ ...editIp, [index]: false })
                        }}
                        icon={faX}
                        className="text-xs duration-150 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <span className="text-center">
                      {value.ip}{" "}
                      <FontAwesomeIcon
                        onClick={() => setEditIp({ ...editIp, [index]: true })}
                        icon={faPen}
                        className="text-gray-500 text-xs duration-150 cursor-pointer"
                      />
                    </span>
                  )}

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
                  <span className="text-center">{value.version}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span onClick={() => handleCopy(value.tokenKey)} className="flex items-center text-xs relative group">
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
                  <span className="flex items-center justify-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FontAwesomeIcon
                            icon={faDownload}
                            className="text-gray-500 hover:text-[var(--theme-color)] text-xs duration-150 cursor-pointer"
                            onClick={() => { location.href = `${value.downloadLink}` }}
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
                                secondaryButtonStyle: "px-4 bg-gray-400 text-black font-prompt",
                                secondaryButtonText: "กลับ",
                                primaryButtonStyle: "bg-[var(--theme-color)] text-white font-prompt",
                                primaryButtonText: "รีเซ็ตเลย"
                              }).onNext(async () => {
                                Loading.pulse("Reseting Token . . .");
                                try {
                                  handleTokenReset(value.name)
                                  setTimeout(()=>{window.location.reload()},1000)
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
                  <span className="text-center">{value.label}</span>
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
