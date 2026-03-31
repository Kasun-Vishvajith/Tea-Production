import "../styles/globals.css";
import React from "react";
import ClientLayout from "../components/ClientLayout";

export const metadata = {
  title: "Tea Production Analytics | Research Portal",
  description: "Advanced ML-powered forecasting for Sri Lankan tea production.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
