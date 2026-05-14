import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PokéHODL - Pokémon TCG Portfolio Tracker",
  description: "Track your Pokémon card collection, calculate ROI, and monitor market trends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
