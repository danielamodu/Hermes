"use client";
import { useEffect, useRef } from "react";

export default function BackgroundEffects() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            if (containerRef.current) {
                containerRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
                containerRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
            }
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden bg-gray-950"
            style={{
                "--mouse-x": "0px",
                "--mouse-y": "0px"
            } as React.CSSProperties}
        >
            {/* Subtle Dot/Grid Pattern */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
            />

            {/* Mouse Tracking Spotlight (Using Hermes Yellow #FFB800) */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 184, 0, 0.08), transparent 40%)`,
                }}
            />
        </div>
    );
}