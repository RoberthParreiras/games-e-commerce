import { getServerSession } from "next-auth";
import { redirect, RedirectType } from "next/navigation";

import {} from "@/app/api/auth/[...nextauth]/route";
import { authOptions } from "../lib/auth";

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

  return <div className="mx-auto w-full max-w-7xl px-4">{children}</div>;
}
