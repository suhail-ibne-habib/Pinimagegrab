"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/ui/Hero";
import { DownloadSection } from "@/components/ui/DownloadSection";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { Features } from "@/components/ui/Features";
import { FAQ } from "@/components/ui/FAQ";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlSubmit = async (submittedUrl) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submittedUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result);

      // Smooth scroll to result
      setTimeout(() => {
        const element = document.getElementById("download-result");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-purple-500/30">
      <Navbar />

      <div className="flex flex-col gap-0">
        <Hero onUrlSubmit={handleUrlSubmit} isLoading={isLoading} />

        <div className="min-h-[20px]">
          {/* Placeholder for spacing transition */}
        </div>

        {error && (
          <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-xl max-w-lg mx-auto mt-4 border border-red-500/20">
            {error}
          </div>
        )}

        <DownloadSection data={data} onReset={handleReset} />

        <HowItWorks />

        <Features />
        
        <FAQ />

        <Footer />
      </div>
    </main>
  );
}
