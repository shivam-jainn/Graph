"use client";

import React from 'react'
import { signIn } from "@/lib/auth-client";
import { Button } from '../ui/button';

import { FaGithub,FaGoogle } from "react-icons/fa6";


export default function AuthButtons() {

  const handleSocialAuth = async (provider: "github" | "google") => {
    await signIn.social({
      provider,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
    <Button variant="outline" className="w-full" onClick={() => handleSocialAuth("github")}>
      <FaGithub className="mr-2 h-4 w-4" />
      Github
    </Button>
    <Button variant="outline" className="w-full" onClick={() => handleSocialAuth("google")}>
      <FaGoogle
        className="mr-2 h-4 w-4"
      />
      Google
    </Button>
  </div>
  )
}
