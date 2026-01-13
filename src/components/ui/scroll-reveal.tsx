"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    duration?: number;
    once?: boolean;
}

export function ScrollReveal({
    children,
    className,
    delay = 0,
    direction = "up",
    duration = 600,
    once = true,
}: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [once]);

    const directionStyles = {
        up: "translate-y-8",
        down: "-translate-y-8",
        left: "translate-x-8",
        right: "-translate-x-8",
        none: "",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "transition-all ease-out",
                isVisible
                    ? "opacity-100 translate-x-0 translate-y-0"
                    : `opacity-0 ${directionStyles[direction]}`,
                className
            )}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// Stagger container for multiple children animations
interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function StaggerContainer({
    children,
    className,
    staggerDelay = 100,
    direction = "up",
}: StaggerContainerProps) {
    return (
        <div className={className}>
            {React.Children.map(children, (child, index) => (
                <ScrollReveal delay={index * staggerDelay} direction={direction}>
                    {child}
                </ScrollReveal>
            ))}
        </div>
    );
}
