"use client";

import { ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StepContainerProps {
    children: ReactNode;
    stepKey: string | number;
    onEnterPress?: () => void;
    autoFocusSelector?: string;
}

export function StepContainer({
    children,
    stepKey,
    onEnterPress,
    autoFocusSelector = "input, textarea, select"
}: StepContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-focus first input when step mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                const firstInput = containerRef.current.querySelector<HTMLElement>(
                    autoFocusSelector
                );
                if (firstInput && "focus" in firstInput) {
                    firstInput.focus();
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [stepKey, autoFocusSelector]);

    // Handle Enter key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && onEnterPress) {
                const target = e.target as HTMLElement;
                // Don't trigger on textareas or if user is in a select
                if (target.tagName !== "TEXTAREA" && target.getAttribute("role") !== "combobox") {
                    e.preventDefault();
                    onEnterPress();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onEnterPress]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={stepKey}
                ref={containerRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
