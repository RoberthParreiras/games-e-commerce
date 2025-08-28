import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-7xl m-auto">
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
