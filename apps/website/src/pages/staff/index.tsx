import type { Session } from "@grassroots/auth";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { sessionOptions } from "@grassroots/auth";
import { getIronSession } from "iron-session";
import { SquarePen } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StaffUserSearch } from "~/components/users/forms/staff-user-search";
import { StaffUsersTable } from "~/components/users/tables/staff-users-table";

export const getServerSideProps: GetServerSideProps<object> = async ({
  req,
  res,
}) => {
  const session = await getIronSession<Session>(req, res, sessionOptions);

  const user = session.user;
  if (user === undefined || !["STAFF", "ADMIN"].includes(user?.role)) {
    res.setHeader("location", "/");
    res.statusCode = 302;
    res.end();
    return {
      props: {},
    };
  }
  return {
    props: {},
  };
};

const StaffPage = () => {
  return (
    <div className="mx-4">
      <Head>
        <title>{`Staff Portal`}</title>
        <meta
          name="description"
          content="Sarafu Network Staff Portal"
          key="desc"
        />
        <meta property="og:title" content="Staff Portal" />
        <meta property="og:description" content="Sarafu Network Staff Portal" />
      </Head>
      <h1 className="mb-4 mt-8 text-center text-3xl font-extrabold">
        Staff Portal
      </h1>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-2">
        <div className="col-span-2 flex justify-start gap-x-2">
          <StaffUserSearch />
          <Link href="/paper/generate">
            <Button variant={"secondary"} className="h-20 w-fit flex-col">
              <SquarePen className="mb-2" />
              Generate Accounts
            </Button>
          </Link>
        </div>
        <Tabs defaultValue="users" className="col-span-2">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <Card className="mt-4 overflow-hidden">
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
