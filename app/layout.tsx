import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Complaint AI Fairness Review",
  description: "Governance decision support for AI complaint prioritisation",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="mx-auto flex w-full max-w-[1400px] flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
