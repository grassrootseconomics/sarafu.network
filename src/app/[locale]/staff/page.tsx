import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { SquarePen } from "lucide-react";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WalletCreator } from "~/components/staff/wallet-creator";
import { Button } from "~/components/ui/button";
import { CardContent } from "~/components/ui/card";
import { StaffUserSearch } from "~/components/users/forms/staff-user-search";
import { StaffUsersTable } from "~/components/users/tables/staff-users-table";
import { auth } from "~/server/api/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("staff");
  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

const StaffPage = async () => {
  const t = await getTranslations("staff");
  const session = await auth();

  const user = session?.user;

  if (
    !Boolean(user) ||
    !["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user?.role ?? "")
  ) {
    return redirect("/");
  }
  return (
    <div className="mx-4 bg-transparent">
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        {t("title")}
      </h1>
      <div className="grid mt-4 gap-4 grid-cols-2 lg:grid-cols-2">
        <div className="col-span-2 flex justify-start gap-x-2">
          <StaffUserSearch />
          <Link href="/paper/generate">
            <Button variant={"secondary"} className="flex-col h-20 w-fit">
              <SquarePen className="mb-2" />
              {t("generateAccounts")}
            </Button>
          </Link>
        </div>
        <Tabs defaultValue="users" className="col-span-2">
          <TabsList>
            <TabsTrigger value="users">{t("users")}</TabsTrigger>
            <TabsTrigger value="nfc-wallet">{t("walletCreator")}</TabsTrigger>
          </TabsList>
          <Card className="overflow-hidden mt-4">
            <CardContent className="p-0">
              <TabsContent value="users" className="mt-0">
                <StaffUsersTable />
              </TabsContent>
              <TabsContent value="nfc-wallet" className="mt-0 p-0">
                <WalletCreator />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffPage;
