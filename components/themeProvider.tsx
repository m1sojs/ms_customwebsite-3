"use client";

import { useEffect, useState } from "react";
import websiteConfig, { loadConfigFromAPI } from "@/lib/websiteConfig";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const initializeConfig = async () => {
      try {
        await loadConfigFromAPI();
        
        document.documentElement.style.setProperty("--theme-color", websiteConfig.themeColor);
        setIsConfigLoaded(true);
        
      } catch (error) {
        console.error('Failed to load config:', error);
        document.documentElement.style.setProperty("--theme-color", websiteConfig.themeColor);
        setIsConfigLoaded(true);
      }
    };

    initializeConfig();
  }, []);

  if (!isConfigLoaded) return;

  return <>{children}</>;
}