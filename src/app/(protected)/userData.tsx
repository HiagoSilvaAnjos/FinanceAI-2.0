"use client";

import { LogOutIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const User = () => {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex justify-between space-y-6">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={session?.user?.image as string | undefined} />
          <AvatarFallback>
            {session?.user?.name?.split(" ")?.[0]?.[0]}
            {session?.user?.name?.split(" ")?.[1]?.[0]}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="font-semibold">{session?.user?.name}</h3>
          <span className="text-muted-foreground block text-xs">
            {session?.user?.email}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          authClient.signOut();
          redirect("/authentication");
        }}
      >
        <LogOutIcon />
      </Button>
    </div>
  );
};

export default User;
