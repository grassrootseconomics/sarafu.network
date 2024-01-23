import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { getIronSession } from "iron-session";
import { SquarePen } from "lucide-react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { CardContent } from "~/components/ui/card";
import { StaffUserSearch } from "~/components/users/forms/staff-user-search";
import { StaffUsersTable } from "~/components/users/tables/staff-users-table";
import { sessionOptions, type SessionData } from "~/lib/session";

export const getServerSideProps: GetServerSideProps<object> = async ({
  req,
  res,
}) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

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
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        Staff Portal
      </h1>
      <div className="grid mt-4 gap-4 grid-cols-2 lg:grid-cols-2">
        <div className="col-span-2 flex justify-start gap-x-2">
          <StaffUserSearch />
          <Link href="/staff/generate">
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
