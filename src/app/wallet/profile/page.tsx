import { redirect } from "next/navigation";
import { auth } from "~/server/api/auth";

/**
 * Wallet profile page - redirects to the user's public profile
 *
 * This page has been merged with the public profile page at /users/[address]
 * The public profile page now shows edit controls when viewing your own profile.
 */
export default async function WalletPage() {
  const session = await auth();

  // Redirect to home if not authenticated
  if (!session?.address) {
    return redirect("/");
  }

  // Redirect to the user's public profile page
  // The profile page will detect it's the user's own profile and show edit controls
  return redirect(`/users/${session.address}`);
}