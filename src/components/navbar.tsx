"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import User from "@/app/(protected)/userData";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      {/* Esquerda */}
      <div className="flex items-center gap-10">
        <Image src={"/logo.svg"} width={173} height={39} alt="Finance AI" />
        <Link
          href={"/"}
          className={
            pathname === "/"
              ? "border-b-2 border-primary text-primary transition duration-300 ease-in-out"
              : "border-b-2 border-transparent text-muted-foreground transition duration-300 ease-in-out hover:border-primary"
          }
        >
          Dashboard
        </Link>
        <Link
          href={"transactions"}
          className={
            pathname === "/transactions"
              ? "border-b-2 border-primary text-primary transition duration-300 ease-in-out"
              : "border-b-2 border-transparent text-muted-foreground transition duration-300 ease-in-out hover:border-primary"
          }
        >
          Transações
        </Link>
      </div>

      {/* Direita */}
      <User />
    </nav>
  );
};

export default NavBar;
