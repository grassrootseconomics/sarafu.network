import { redirect } from "next/navigation";
import { auth } from "~/server/api/auth";

import { Profile } from "./profile";

export default async function WalletPage() {
  const session = await auth();
  if (!session?.address) return redirect("/");
  return <Profile />;
}
