import "./globals.css";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance AI 2.0",
  description: "Sistema de registro de dados com integração de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head></head>
      <body
        className={`${roboto.className} antialiased transition-colors duration-500`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
