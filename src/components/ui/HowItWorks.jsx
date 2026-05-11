import { Copy, Link, Check } from "lucide-react";

const steps = [
    {
        icon: Copy,
        title: "1. Copy URL",
        description: "Find the Pin, photo, or carousel you want to save from Pinterest and copy its link."
    },
    {
        icon: Link,
        title: "2. Paste Link",
        description: "Return to PinImageGrab and paste your link into the input field at the top of the page."
    },
    {
        icon: Check,
        title: "3. Download",
        description: "Hit the download button and the media will be saved to your device in original quality."
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-4 relative">
            <div className="container mx-auto">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
                        How It <span className="relative inline-block">
                            Works
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                        </span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="glass border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 group">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Copy className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">1. Copy Pinterest URL</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Find the Pin, whether it's an image, video, or GIF, and copy its link from the address bar or share menu.
                        </p>
                    </div>

                    <div className="glass border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 group">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Link className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">2. Paste Link</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Paste the link into the PinImageGrab input field above. Our system auto-detects the content type.
                        </p>
                    </div>

                    <div className="glass border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 group">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Check className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">3. Download</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Click download and save the high-resolution image or video directly to your device.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
