import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SideNav } from "./components/SideNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BridgeAI",
  description:
    "End of day review queue: teacher notes in, suggested parent communications out.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <SideNav />
        <div className="flex min-h-full min-w-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
