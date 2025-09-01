"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPen } from "@fortawesome/free-solid-svg-icons";

interface HistoryInterface {
  name: string;
  label: string;
  discount: string;
  image: string;
  ip: string;
  price: number;
  downloadLink: string;
  expire: string;
  createdAt: string;
}

export default function Profile() {
  const [page, setPage] = useState("scripts");
  const [editIp, setEditIp] = useState<Record<number, boolean>>({});
  const [history, setHistory] = useState<HistoryInterface[]>([]);
  const [userData, setUserData] = useState({ id: "", avatar: "", username: "", email: "" });

  useEffect(() => {
    Loading.init({
      svgColor: "#cdff61",
    });

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
        if (!res.ok && !res2.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        const data2 = await res2.json();
        setHistory(data2.history)
        setUserData({ id: data.id, avatar: data.avatar, username: data.global_name, email: data.email });
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
          <span className="flex flex-col">
            <span>{userData.username}</span>
            <span>{userData.email}</span>
          </span>
        </span>
        <div className="flex text-white gap-2 ml-4 mt-8">
          <span onClick={() => setPage("scripts")} className="bg-white/4 rounded-t-xl backdrop-blur-md p-2 px-4 hover:bg-red-600/60 duration-300 cursor-pointer">รายการสคริปต์</span>
          <span onClick={() => setPage("history")} className="bg-white/4 rounded-t-xl backdrop-blur-md p-2 px-4 hover:bg-red-600/60 duration-300 cursor-pointer">ประวัติการซื้อสินค้า</span>
        </div>
        {page === "scripts" ? (
          <div className="flex flex-col w-full min-h-[120px] p-4 gap-2 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
            {history.length > 0 && (
              <div className="grid grid-cols-4 w-full p-2 bg-white/10 rounded-lg border border-white/20 text-sm sm:text-base font-semibold">
                <span className="text-center">สินค้า</span>
                <span className="text-center">ไอพีเซิฟเวอร์</span>
                <span className="text-center">จะหมดอายุในอีก</span>
                <span className="text-center">จัดการ</span>
              </div>
            )}

            {history.length === 0 ? (
              <>ไม่พบประวัติการซื้อสินค้า</>
            ) : (
              history.map((value, index) => (
                <div key={index} className="grid grid-cols-4 w-full p-2 bg-white/4 border-white/20 rounded-lg text-sm sm:text-base">
                  <span className="text-center">{value.label}</span>

                  {editIp[index] ? (
                    <input
                      type="text"
                      name="ip"
                      id={`ip-${index}`}
                      value={value.ip}
                      placeholder="ไอพีเซิฟเวอร์"
                      className="bg-white/1 border border-white/4 hover:bg-[#cd0101]/60 outline-none text-sm font-prompt duration-150 w-full p-1 px-5 rounded-xl"
                      onChange={(e) => {
                        const newHistory = [...history];
                        newHistory[index].ip = e.target.value;
                        setHistory(newHistory);
                      }}
                      onBlur={() => setEditIp({ ...editIp, [index]: false })}
                    />
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
                  <span className="text-center">
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="text-gray-500 hover:text-[var(--theme-color)] text-xs duration-150 cursor-pointer"
                      onClick={() => { location.href = `${value.downloadLink}` }}
                    />
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col w-full min-h-[120px] p-4 gap-2 bg-white/4 rounded-xl backdrop-blur-md overflow-hidden">
            {history.length > 0 && (
              <div className="grid grid-cols-5 w-full p-2 bg-white/10 rounded-lg border border-white/20 text-sm sm:text-base font-semibold">
                <span className="text-center">สินค้า</span>
                <span className="text-center">ราคา</span>
                <span className="text-center">ส่วนลด</span>
                <span className="text-center">จะหมดอายุในอีก</span>
                <span className="text-center">ซื้อเมื่อ</span>
              </div>
            )}

            {history.length === 0 ? (
              <>ไม่พบประวัติการซื้อสินค้า</>
            ) : (
              history.map((value, index) => (
                <div key={index} className="grid grid-cols-5 w-full p-2 bg-white/4 border-white/20 rounded-lg text-sm sm:text-base">
                  <span className="text-center">{value.label}</span>
                  <span className="text-center">{value.price}฿ </span>
                  <span className="text-center">{value.discount ? value.discount : '-'}</span>
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
