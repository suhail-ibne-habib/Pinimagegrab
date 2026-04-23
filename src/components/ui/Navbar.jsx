import Link from "next/link";
import { Share2, Menu, X, Github, Database } from "lucide-react";
import { useState } from "react";
// Note: Lucide might not have a dedicated Pinterest icon, using standard text or generic share for now,
// or import a custom SVG if needed. Let's use a red accent color.

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <a href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg font-serif">P</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        PinImageGrab
                    </span>
                </a>
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        How it Works
                    </Link>
                    <Link href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Features
                    </Link>
                </div>
            </div>
        </nav>
    );
}
