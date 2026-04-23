"use client";

import { useState, useRef, useEffect } from "react";
import { Link as LinkIcon, ArrowRight, Loader2 } from "lucide-react";
import gsap from "gsap";

export function Hero({ onUrlSubmit, isLoading }) {
    const [url, setUrl] = useState("");
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-animate", {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.2
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim()) {
            onUrlSubmit(url.trim());
        }
    };

    return (
        <section ref={containerRef} className="relative pt-32 pb-20 px-4 min-h-[60vh] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-black pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse-slow" />

            <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-sm font-medium text-gray-300">V2.0 Now Supporting Pinterest Video</span>
                </div>

                <h1 className="hero-animate text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                    Download <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Pinterest</span> content in <br className="hidden md:block" />
                    Full Quality.
                </h1>

                <p className="hero-animate text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Save images, GIFs, and videos from Pinterest instantly. No watermarks, no login required. Just paste the link.
                </p>

                <form onSubmit={handleSubmit} className="hero-animate relative max-w-2xl mx-auto mt-12 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl">
                        <div className="pl-4 text-gray-400">
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste Pinterest URL (e.g., pinterest.com/pin/...)"
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg py-3 px-4 w-full focus:ring-0"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Download
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
