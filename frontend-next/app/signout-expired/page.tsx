"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SignOutExpired() {
  useEffect(() => {
    signOut({ callbackUrl: "/signin" });
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <p>Your session has expired. You are being redirected...</p>
    </div>
  );
}
