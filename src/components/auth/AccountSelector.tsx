"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSession } from "@/lib/auth-client";
import { Button } from "../ui/button";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function AccountSelector() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: session } = await getSession();
      if (session?.user) {
        setUser(session.user);
      }
    }
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Loading account...
      </div>
    );
  }

  return (
    <Button variant={"ghost"} className="flex-end w-full text-white flex items-center gap-3 p-8 hover:bg-gray-100  cursor-pointer transition-all">
      <div className="hover:text-black">
        {user.image ? (
          <Image
            src={user.image}
            alt="User avatar"
            width={40}
            height={40}
            className="rounded-full object-cover hover:contrast-75"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm">
            {user.name?.[0] ?? "U"}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium hover:text-black">{user.name ?? "Unnamed"}</span>
        <span className="text-xs hover:text-black">{user.email}</span>
      </div>
    </Button>
  );
}