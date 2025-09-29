export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto w-full max-w-7xl px-4">{children}</div>;
}
