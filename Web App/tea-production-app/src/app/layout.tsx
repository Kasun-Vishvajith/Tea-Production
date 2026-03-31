import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/UI/Navbar";
import FloatingMenu from "@/components/UI/FloatingMenu";
import { ModeProvider } from "@/context/ModeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ceylon Tea Intelligence — Predicting Sri Lanka's Tea Production",
  description:
    "SARIMAX × CatBoost hybrid forecasting system for Sri Lanka tea production across 3 elevation zones and 17 tea categories, powered by real climate data.",
  keywords: [
    "Sri Lanka",
    "Tea Production",
    "Forecasting",
    "SARIMAX",
    "CatBoost",
    "Climate",
    "Machine Learning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <ModeProvider>
          <Navbar />
          <main className="flex-1 text-foreground">{children}</main>
          <FloatingMenu />
        </ModeProvider>
      </body>
    </html>
  );
}
