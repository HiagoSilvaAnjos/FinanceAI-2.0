"use client";

import {
  ChevronDown,
  ChevronUp,
  LoaderCircleIcon,
  LogOutIcon,
  MailIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || saved === null;
  }
  return true;
};

const User = () => {
  const { data: session } = authClient.useSession();

  const [signOutIsLoading, setSignOutIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const body = document.documentElement;
    if (isDarkMode) {
      body.classList.remove("light");
      body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark");
      body.classList.add("light");
      localStorage.setItem("theme", "light");
    }

    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent("themeChanged"));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const signOut = async () => {
    setSignOutIsLoading(true);
    await authClient.signOut();
    setSignOutIsLoading(false);
    redirect("/authentication");
  };

  const getDisplayedName = (fullName?: string) => {
    if (!fullName) {
      return "";
    }
    const nameParts = fullName.split(" ").filter((part) => part.length > 0);
    const ignoredWords = ["da", "de", "do", "dos", "e", "das"];
    const filteredNameParts = nameParts.filter(
      (part) => !ignoredWords.includes(part.toLowerCase()),
    );
    if (filteredNameParts.length > 1) {
      return `${filteredNameParts[0]} ${filteredNameParts[1]}`;
    }
    return filteredNameParts[0] || nameParts.join(" ");
  };

  const displayedName = getDisplayedName(session?.user?.name);

  const getAvatarFallback = (fullName?: string) => {
    if (!fullName) {
      return "";
    }
    const nameParts = fullName.split(" ").filter((part) => part.length > 0);
    const firstInitial = nameParts?.[0]?.[0] || "";
    const secondInitial = nameParts.length > 1 ? nameParts[1][0] : "";
    return firstInitial + secondInitial;
  };
  const avatarFallback = getAvatarFallback(session?.user?.name);

  return (
    <DropdownMenu onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 transition ease-in-out hover:bg-zinc-200 dark:border-white/55 dark:hover:bg-zinc-900">
          <Avatar>
            <AvatarImage src={session?.user?.image as string | undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          <h3 className="text-base font-medium">{displayedName}</h3>

          {/* Renderização condicional do ícone */}
          {isMenuOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            {session?.user?.email}
            <DropdownMenuShortcut>
              <MailIcon size={20} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {/* Para desktop - usar submenu */}
          <div className="hidden sm:block">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Tema</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent sideOffset={10} className="w-25">
                  <DropdownMenuItem
                    className={`flex cursor-pointer justify-between ${
                      !isDarkMode ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      if (isDarkMode) toggleTheme();
                    }}
                  >
                    Claro <SunIcon />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`flex cursor-pointer justify-between ${
                      isDarkMode ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      if (!isDarkMode) toggleTheme();
                    }}
                  >
                    Escuro <MoonIcon />
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </div>

          {/* Para mobile - mostrar diretamente no menu principal */}
          <div className="block sm:hidden">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Tema
            </DropdownMenuLabel>
            <DropdownMenuItem
              className={`flex cursor-pointer justify-between ${
                !isDarkMode ? "bg-accent" : ""
              }`}
              onClick={() => {
                if (isDarkMode) toggleTheme();
              }}
            >
              Claro <SunIcon />
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`flex cursor-pointer justify-between ${
                isDarkMode ? "bg-accent" : ""
              }`}
              onClick={() => {
                if (!isDarkMode) toggleTheme();
              }}
            >
              Escuro <MoonIcon />
            </DropdownMenuItem>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={signOut}
          disabled={signOutIsLoading}
        >
          Sair{" "}
          {signOutIsLoading && <LoaderCircleIcon className="animate-spin" />}
          <DropdownMenuShortcut>
            <LogOutIcon size={20} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default User;
