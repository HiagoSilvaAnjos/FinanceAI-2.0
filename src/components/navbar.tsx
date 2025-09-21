"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import User from "@/components/userData";

const NavBar = () => {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/transactions", label: "Transações" },
  ];

  useEffect(() => {
    // Ler o tema inicial
    const theme = localStorage.getItem("theme");
    setIsDark(theme === "dark" || theme === null);

    // Escutar mudanças de tema
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem("theme");
      setIsDark(newTheme === "dark" || newTheme === null);
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const logoSrc = isDark ? "/logo.svg" : "/logo-2.svg";

  return (
    <nav className="flex items-center justify-between border-b border-solid px-4 py-4 md:px-8">
      {/* Esquerda */}
      <div className="flex items-center gap-4 md:gap-10">
        <Image
          src={logoSrc}
          width={173}
          height={39}
          alt="Finance AI"
          priority
        />

        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "border-b-2 border-primary font-semibold text-primary transition duration-300 ease-in-out"
                  : "border-b-2 border-transparent font-semibold text-black transition duration-300 ease-in-out hover:border-primary dark:text-white"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Direita */}
      <div className="hidden md:block">
        <User />
      </div>

      {/* Menu Hambúrguer para Telas Pequenas */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Finance AI</SheetTitle>
            <div className="mt-10 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg ${
                    pathname === link.href
                      ? "border-b-2 border-primary text-primary transition duration-300 ease-in-out"
                      : "border-b-2 border-transparent text-black transition duration-300 ease-in-out hover:border-primary dark:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-auto">
                <User />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default NavBar;
