import type { Session } from "@grassroots/auth";
import { type GetServerSideProps } from "next";
import { sessionOptions } from "@grassroots/auth";
import { getIronSession } from "iron-session";
import { toast } from "sonner";

import type { UpdateUserProfileInput } from "@grassroots/validators/user";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ProfileForm } from "~/components/users/forms/profile-form";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps<object> = async ({
  req,
  res,
}) => {
  const session = await getIronSession<Session>(req, res, sessionOptions);
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

  const updateUser = (values: UpdateUserProfileInput) => {
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
    <ContentContainer title="Profile">
      <BreadcrumbResponsive
        items={[
          {
            label: "Wallet",
            href: "/wallet",
          },
          { label: "Profile" },
        ]}
      />
      <div className="mx-auto flex w-full flex-grow flex-col px-1 sm:px-2">
        <div className="col-span-12 mx-auto flex min-w-full flex-col items-center justify-center gap-2 text-center md:min-w-[60%]">
          <Avatar className="h-24 w-24 flex-none">
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
          className="col-span-12 m-2 mx-auto mt-2 min-w-full md:min-w-[60%]"
        >
          <TabsList className="mx-auto my-2 mb-4 grid w-fit grid-cols-2">
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
    </ContentContainer>
  );
};

export default WalletPage;
