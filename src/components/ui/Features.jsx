import { Zap, Shield, Image, Video, Layers } from "lucide-react";

const features = [
    {
        icon: Image,
        title: "High-Res Images",
        description: "Extract the original 4K/HD quality images directly from Pinterest content servers."
    },
    {
        icon: Video,
        title: "Video & GIF Download",
        description: "Save Pinterest videos and GIFs to your device in MP4 format instantly."
    },
    {
        icon: Layers,
        title: "Batch Ready",
        description: "Our engine is built to handle complex pins, carousels, and story pins seamlessly."
    },
    {
        icon: Shield,
        title: "Anonymous & Free",
        description: "No login, no tracking. Your activity is completely private and secure."
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 px-4 bg-gradient-to-b from-transparent to-black/50">
            <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Why Choose <span className="text-red-500">PinImageGrab</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-12 max-w-lg">
                        We've built the most reliable tool for Pinterest enthusiasts who need their inspiration offline without any hassle.
                    </p>

                    <div className="space-y-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                    <feature.icon className={`w-6 h-6 ${index === 0 ? 'text-red-400' : index === 1 ? 'text-orange-400' : index === 2 ? 'text-yellow-400' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual Decoration Right Side */}
                <div className="relative h-[600px] border border-white/10 rounded-3xl bg-gradient-to-br from-red-900/20 to-black overflow-hidden hidden lg:block">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.3),rgba(0,0,0,0))]" />
                    <img
                        src="/why.png"
                        alt="Why Choose PinImageGrab"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700 ease-out"
                    />
                </div>
            </div>
        </section>
    );
}
