"use client";

import { LogOutIcon, MailIcon, MoonIcon, SunIcon } from "lucide-react";
import { redirect } from "next/navigation";

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

const User = () => {
  const { data: session } = authClient.useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex cursor-pointer justify-between space-y-6 rounded-lg border border-white/55 px-4 py-2 transition ease-in-out hover:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={session?.user?.image as string | undefined} />
              <AvatarFallback>
                {session?.user?.name?.split(" ")?.[0]?.[0]}
                {session?.user?.name?.split(" ")?.[1]?.[0]}
              </AvatarFallback>
            </Avatar>

            <h3 className="text-xs font-semibold">{session?.user?.name}</h3>
          </div>
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Tema</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={10} className="w-25">
                <DropdownMenuItem className="flex cursor-pointer justify-between">
                  Claro <SunIcon />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer justify-between">
                  Escuro <MoonIcon />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            authClient.signOut();
            redirect("/authentication");
          }}
        >
          Sair
          <DropdownMenuShortcut>
            <LogOutIcon size={20} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default User;
