"use client";

import { useEffect, useRef } from "react";
import { Download, CheckCircle, RefreshCw, Instagram } from "lucide-react";
import { Button } from "./Button";
import { gsap } from "gsap";

export function DownloadSection({ data, onReset }) {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (data) {
            gsap.fromTo(sectionRef.current,
                { autoAlpha: 0, y: 50 },
                { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }
            );
        }
    }, [data]);

    if (!data) return null;

    const handleDownload = async (urlToDownload, filename) => {
        try {
            const response = await fetch(`/api/proxy?url=${encodeURIComponent(urlToDownload)}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `pin-content-${Date.now()}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error("Download failed", e);
            alert("Failed to download content. Try opening it in a new tab.");
        }
    };

    // Use imageUrls array if available, otherwise just imageUrl
    const images = data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls : (data.imageUrl ? [data.imageUrl] : []);

    return (
        <section id="download-result" className="py-20 px-4 min-h-[600px] flex items-center justify-center">
            <div
                ref={sectionRef}
                className="w-full max-w-6xl glass-card rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden invisible"
            >
                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="grid md:grid-cols-2 gap-12 items-start relative z-10">
                    {/* Media Section */}
                    <div className="flex flex-col gap-6">
                        {/* Video Player if available */}
                        {data.videoUrl && (
                            <div className="relative w-full rounded-[2rem] border-4 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10 bg-black group">
                                <video
                                    src={data.videoUrl}
                                    controls
                                    className="w-full h-auto max-h-[600px]"
                                    poster={images[0]} // Use first image as poster
                                />
                                <div className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={() => handleDownload(data.videoUrl, `pin-video-${Date.now()}.mp4`)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                                    >
                                        <Download className="w-4 h-4" />
                                        Save Video
                                    </button>
                                </div>
                            </div>
                        )}

                        {images.map((img, idx) => (
                            <div key={idx} className="relative w-full rounded-[2rem] border-4 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10 bg-black">
                                {/* Image */}
                                <div className="relative group">
                                    <img
                                        src={img}
                                        alt={`Pinterest Content ${idx + 1}`}
                                        className="w-full h-auto object-contain max-h-[600px]"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            // Fallback to proxy if direct load fails
                                            e.target.onerror = null;
                                            e.target.src = `/api/proxy?url=${encodeURIComponent(img)}`;
                                        }}
                                    />
                                    {/* Download Overlay Button */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center opacity-100 md:inset-0 md:bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={() => handleDownload(img, `pin-image-${Date.now()}.jpg`)}
                                            className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer shadow-lg w-full md:w-auto justify-center"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {images.length > 1 && (
                            <p className="text-center text-sm text-gray-400">
                                Found {images.length} images. Hover to download individually.
                            </p>
                        )}
                    </div>

                    {/* Content Right Side */}
                    <div className="text-left space-y-8 sticky top-24">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    {/* Generic User Icon or Initials */}
                                    <span className="text-white font-bold text-lg">{data.author ? data.author[0].toUpperCase() : 'P'}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    {data.authorName || 'Pinterest User'}
                                    <span className="text-blue-500"><CheckCircle className="w-4 h-4 fill-blue-500 text-black" /></span>
                                </h3>
                                <p className="text-sm text-gray-400">@{data.author || 'unknown'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Description</h4>
                            <p className="text-gray-200 italic leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {data.caption ? data.caption : "No description available."}
                            </p>
                        </div>

                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <p className="text-sm text-green-200">
                                Content ready for download.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onReset}
                                className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white font-medium flex items-center justify-center gap-2 pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Download Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
