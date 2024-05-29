import { getIronSession } from "iron-session";
import { type GetServerSideProps } from "next";
import { toast } from "sonner";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentLayout } from "~/components/layout/content-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  ProfileForm,
  type UserProfileFormType,
} from "~/components/users/forms/profile-form";
import { sessionOptions, type SessionData } from "~/lib/session";

import { api } from "~/utils/api";
export const getServerSideProps: GetServerSideProps<object> = async ({
  req,
  res,
}) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const user = session.user;
  if (user === undefined) {
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

const WalletPage = () => {
  const utils = api.useUtils();

  const { mutateAsync, isPending } = api.me.update.useMutation();
  const { data: me } = api.me.get.useQuery();

  const updateUser = (values: UserProfileFormType) => {
    mutateAsync(values)
      .then(() => {
        toast.success("Profile updated");
        void utils.me.invalidate();
      })
      .catch((err: Error) => {
        toast.error(err.message);
      });
  };
  return (
    <ContentLayout title="Profile">
      <BreadcrumbResponsive
        items={[
          {
            label: "Wallet",
            href: "/wallet",
          },
          { label: "Profile" },
        ]}
      />
      <div className="w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
        <div className="col-span-12 mx-auto md:min-w-[60%] min-w-full flex flex-col gap-2 items-center justify-center text-center">
          <Avatar className="flex-none h-24 w-24">
            <AvatarImage src="/apple-touch-icon.png" alt="@unknown" />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="flex-1 flex-col items-center justify-center text-center">
            <div className="text-md font-semibold">
              {me?.given_names ?? "Unknown"}
            </div>
            <div className="text-sm font-semibold text-primary/80">
              {me?.vpa}
            </div>
          </div>
        </div>
        <Tabs
          defaultValue="profile"
          className="m-2 col-span-12 mt-2 mx-auto md:min-w-[60%] min-w-full"
        >
          <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger disabled={true} value="vouchers">
              Vouchers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-0">
            <div className="p-4">
              {me && (
                <ProfileForm
                  buttonLabel="Update"
                  isLoading={isPending}
                  initialValues={me}
                  onSubmit={updateUser}
                />
              )}
            </div>
          </TabsContent>
          <TabsContent value="vouchers" className="mt-0"></TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default WalletPage;
