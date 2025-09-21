"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light" // Sempre tema light
      className="toaster group"
      style={
        {
          "--normal-bg": "#ffffff", // Fundo branco
          "--normal-text": "#000000", // Texto preto
          "--normal-border": "#71717a", // Borda cinza (zinc-500)
          "--success-bg": "#ffffff",
          "--success-text": "#000000",
          "--success-border": "#71717a",
          "--error-bg": "#ffffff",
          "--error-text": "#000000",
          "--error-border": "#71717a",
          "--warning-bg": "#ffffff",
          "--warning-text": "#000000",
          "--warning-border": "#71717a",
          "--info-bg": "#ffffff",
          "--info-text": "#000000",
          "--info-border": "#71717a",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #71717a",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
