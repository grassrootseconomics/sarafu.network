import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { SquarePen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { CardContent } from "~/components/ui/card";
import { StaffUserSearch } from "~/components/users/forms/staff-user-search";
import { StaffUsersTable } from "~/components/users/tables/staff-users-table";
import { auth } from "~/server/api/auth";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Portal",
  description: "Sarafu Network Staff Portal",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

};


const StaffPage = async () => {
  const session = await auth();

  const user = session?.user;
  if (user === undefined || !["STAFF", "ADMIN"].includes(user?.role)) {
    redirect("/");
  }
  return (
    <div className="mx-4">
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        Staff Portal
      </h1>
      <div className="grid mt-4 gap-4 grid-cols-2 lg:grid-cols-2">
        <div className="col-span-2 flex justify-start gap-x-2">
          <StaffUserSearch />
          <Link href="/paper/generate">
            <Button variant={"secondary"} className="flex-col h-20 w-fit">
              <SquarePen className="mb-2" />
              Generate Accounts
            </Button>
          </Link>
        </div>
        <Tabs defaultValue="users" className="col-span-2">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <Card className="overflow-hidden mt-4">
            <CardContent className="p-0">
              <TabsContent value="users" className="mt-0">
                <StaffUsersTable />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffPage;
