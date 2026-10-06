import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MilestoneWork — Freelance Escrow on Arc",
  description: "The freelance contract that pays itself. Zero middlemen, zero platform fees. Powered by Arc mainnet.",
  openGraph: {
    title: "MilestoneWork",
    description: "Freelance escrow on Arc — pay when work is done, not when an intermediary says so.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
