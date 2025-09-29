"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex justify-between bg-[#393E46] px-4 text-[#DFD0B8]">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="logo company"
          width={120}
          height={120}
          priority
        />
      </Link>
      <nav className="flex w-1/3 items-center justify-around md:w-1/4">
        <SignedIn>
          <div className="flex w-full justify-around gap-3">
            <Link
              href="/"
              className="my-auto text-xs hover:text-sky-500 sm:text-sm"
            >
              Home
            </Link>
            <Link
              href="/admin"
              className="my-auto text-xs text-wrap hover:text-sky-500 sm:text-sm"
            >
              Admin
            </Link>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex w-full justify-around">
            <Link href="/" className="text-xs hover:text-sky-500 sm:text-lg">
              Home
            </Link>
            <Link
              href="/sign-in"
              className="text-xs hover:text-sky-500 sm:text-lg"
            >
              Login
            </Link>
          </div>
        </SignedOut>
      </nav>
    </header>
  );
}
