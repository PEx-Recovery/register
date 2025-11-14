import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Project Exodus Register',
  description: 'Member check-in application.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
