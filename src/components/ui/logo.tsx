import Link from "next/link";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    showTagline?: boolean;
    inverted?: boolean;
    href?: string;
    className?: string;
}

export function Logo({
    size = "md",
    showTagline = true,
    inverted = false,
    href = "/",
    className
}: LogoProps) {
    const sizeConfig = {
        sm: { box: "h-8 w-8", icon: "h-4 w-4", text: "text-lg", tagline: "text-[10px]" },
        md: { box: "h-10 w-10", icon: "h-5 w-5", text: "text-xl", tagline: "text-xs" },
        lg: { box: "h-12 w-12", icon: "h-6 w-6", text: "text-2xl", tagline: "text-xs" },
    };

    const config = sizeConfig[size];

    const content = (
        <div className={cn("flex items-center gap-3", className)}>
            <div className={cn(
                config.box,
                "rounded-xl bg-primary flex items-center justify-center shrink-0"
            )}>
                <Scale className={cn(config.icon, "text-white")} />
            </div>
            <div>
                <span className={cn(
                    config.text,
                    "font-extrabold tracking-tight",
                    inverted ? "text-white" : "text-gray-900 dark:text-white"
                )}>
                    Renjana
                </span>
                {showTagline && (
                    <p className={cn(
                        config.tagline,
                        inverted ? "text-gray-400" : "text-gray-500 dark:text-gray-400"
                    )}>
                        Elite Legal Training
                    </p>
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
}
