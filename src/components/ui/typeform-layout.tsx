"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TypeformLayoutProps {
    children: ReactNode;
}

interface TypeformHeaderProps {
    children: ReactNode;
}

interface TypeformFooterProps {
    children: ReactNode;
}

interface TypeformContentProps {
    children: ReactNode;
}

export function TypeformLayout({ children }: TypeformLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-white flex flex-col">
            {children}
        </div>
    );
}

export function TypeformHeader({ children }: TypeformHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-4">
                {children}
            </div>
        </header>
    );
}

export function TypeformContent({ children }: TypeformContentProps) {
    return (
        <main className="flex-1 overflow-y-auto pt-24 pb-32">
            <div className="max-w-2xl mx-auto px-6 flex items-center min-h-[calc(100vh-14rem)]">
                <div className="w-full">
                    {children}
                </div>
            </div>
        </main>
    );
}

export function TypeformFooter({ children }: TypeformFooterProps) {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-4">
                {children}
            </div>
        </footer>
    );
}
