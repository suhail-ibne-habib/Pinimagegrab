"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "How to download Pinterest videos using PinImageGrab?",
        answer: "Simply copy the URL of the Pinterest video you want to download, paste it into the input box above, and click 'Download'. Our system will process the link and provide you with a high-quality MP4 file."
    },
    {
        question: "Is PinImageGrab free to use?",
        answer: "Yes, PinImageGrab is 100% free. You can download as many Pinterest images, videos, and GIFs as you want without any hidden costs or subscriptions."
    },
    {
        question: "Do I need to login to download Pinterest content?",
        answer: "No login or registration is required. We prioritize your privacy and anonymity, allowing you to save content without sharing any personal information."
    },
    {
        question: "Can I download Pinterest Story Pins and Carousels?",
        answer: "Absolutely! PinImageGrab is optimized to handle all types of Pinterest content, including Story Pins, Carousels (multiple images), and standard Pins."
    },
    {
        question: "In what quality will the content be downloaded?",
        answer: "We always aim for the highest available quality. For images, this usually means the original resolution (up to 4K), and for videos, the best HD version provided by Pinterest servers."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section id="faq" className="py-24 px-4 bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Frequently Asked <span className="text-red-500">Questions</span>
                    </h2>
                    <p className="text-gray-400">
                        Everything you need to know about downloading Pinterest content.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'bg-white/5 border-red-500/30' : 'bg-transparent'}`}
                        >
                            <button 
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left group"
                            >
                                <span className={`text-lg font-semibold transition-colors ${openIndex === index ? 'text-red-400' : 'text-white group-hover:text-red-400'}`}>
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 ml-4 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                    {openIndex === index ? <Minus className="w-5 h-5 text-red-400" /> : <Plus className="w-5 h-5 text-gray-500" />}
                                </div>
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
