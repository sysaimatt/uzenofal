import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Üzenőfal – STRT",
  description: "Egyszerű publikus üzenőfal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "#f5f6f8", color: "#2E3649" }}>
        {children}
      </body>
    </html>
  );
}
