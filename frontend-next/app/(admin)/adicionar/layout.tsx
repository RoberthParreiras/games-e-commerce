import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <header className="pl-4">
        <Image
          src="/logo.png"
          alt="logo company"
          width={120}
          height={120}
          priority
        />
      </header>
      {children}
    </div>
  );
}
