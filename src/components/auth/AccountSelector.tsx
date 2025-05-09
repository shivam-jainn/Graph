"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSession } from "@/lib/auth-client";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function AccountSelector() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const {data: session} = await getSession();
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
    <div className="flex items-center gap-3 p-4 hover:bg-gray-100 rounded-xl cursor-pointer transition-all">
      {user.image ? (
        <Image
          src={user.image}
          alt="User avatar"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white">
          {user.name?.[0] ?? "U"}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{user.name ?? "Unnamed"}</span>
        <span className="text-xs text-gray-500">{user.email}</span>
      </div>
    </div>
  );
}
