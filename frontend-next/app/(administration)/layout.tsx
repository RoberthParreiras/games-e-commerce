import { getServerSession } from "next-auth";
import { redirect, RedirectType } from "next/navigation";

import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.accessTokenExpires && Date.now() > session.accessTokenExpires)
  ) {
    redirect("/signout-expired", RedirectType.push);
  }
  return <div className="w-full max-w-7xl mx-auto px-4">{children}</div>;
}
