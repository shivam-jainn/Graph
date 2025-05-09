import { ReactNode } from "react";
import { headers } from "next/headers";
import { authBackgrounds } from "@/lib/vars.config";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") || "";
  const isSignIn = pathname.includes("/signin");

  const imageUrl = isSignIn ? authBackgrounds.signIn : authBackgrounds.signUp;

  return (
    <div className="min-h-screen w-full flex">
      {/* Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={imageUrl}
          alt={isSignIn ? "Sign In Background" : "Sign Up Background"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}