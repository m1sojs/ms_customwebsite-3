"use client"

import 'aos/dist/aos.css';
import AOS from 'aos';
import { useRouter } from "next/navigation";
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import Hero from "@/components/Hero"
import WhyUs from "@/components/whyUs";
import Teams from "@/components/Teams";
import ProductsPreview from "@/components/productsPreview";
import Footer from "@/components/Footer"
import React, { useEffect } from "react";
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    Loading.init({
      svgColor: "#cd0101",
    });

    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get("access_token");

    const checkLoginToken = async () => {
      Loading.pulse("Loading . . .");
      try {
        if (!accessToken) return;

        const serverResponse = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken: accessToken }),
        });

        if (!serverResponse.ok) throw new Error("Failed to fetch user data");

        window.history.replaceState({}, document.title, window.location.pathname);
        window.dispatchEvent(new Event("login-success"));

        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Error processing login:", error);
      } finally {
        setTimeout(() => Loading.remove(), 500);
      }
    };

    checkLoginToken();
  }, [router]);

  const handleScollDown = () => {
    window.scrollTo({ top: 617, behavior: "smooth" });
  };

  return (
    <div data-aos="fade-up" className="flex flex-col items-center min-h-screen p-8 sm:p-15 font-[family-name:var(--font-poppins)] ">
      <Hero />

      <div className="flex mt-30">
        <div className="flex items-center text-white bg-[#32323266] hover:bg-[#cd0101]/60 px-5 py-2 gap-2 rounded-xl duration-150 hover:cursor-pointer" onClick={handleScollDown}>
          <span className="text-sm">More</span>
          <FontAwesomeIcon icon={faAngleDown} className="text-gray-400 text-xs duration-500 bounce-animation" />
        </div>
      </div>

      <ProductsPreview />
      <WhyUs />
      <Teams />

      <Footer />
    </div>
  );
}
