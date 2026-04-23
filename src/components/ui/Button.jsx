import { cn } from "@/lib/utils";

export default function Button({ children, className, ...props }) {
    return (
        <button
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 active:scale-95 cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
