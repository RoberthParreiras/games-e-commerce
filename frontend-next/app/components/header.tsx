"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex bg-[#393E46] justify-between px-4 text-[#DFD0B8]">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="logo company"
          width={120}
          height={120}
          priority
        />
      </Link>
      <nav className="flex items-center justify-around w-1/3 md:w-1/4">
        {session?.user ? (
          <div className="flex justify-around gap-4 w-full">
            <Link href="/" className="text-xs sm:text-lg hover:text-sky-500">
              Home
            </Link>
            <Link
              href="/admin"
              className="text-xs sm:text-sm text-wrap my-auto hover:text-sky-500"
            >
              Welcome, {session.user.name}
            </Link>
          </div>
        ) : (
          <div className="flex justify-around w-full">
            <Link href="/" className="text-xs sm:text-lg hover:text-sky-500">
              Home
            </Link>
            <Link
              href="/signin"
              className="text-xs sm:text-lg hover:text-sky-500"
            >
              Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
