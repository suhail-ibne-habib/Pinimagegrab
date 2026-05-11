import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center">
                                <span className="text-white font-bold text-sm font-serif">P</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                PinImageGrab
                            </span>
                        </Link>
                        <p className="text-gray-400 max-w-sm">
                            The fastest way to download Pinterest content. Secure, anonymous, and high quality.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">DMCA</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © 2026 PinImageGrab. Not affiliated with Pinterest.
                    </p>
                    <div className="flex items-center gap-6">
                        {/* Socials placeholder */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
