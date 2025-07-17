"use client";
import { toast } from "sonner";
import Address from "~/components/address";
import Identicon from "~/components/identicon";
import { ContentContainer } from "~/components/layout/content-container";
import { ResponsiveModal } from "~/components/modal";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  ProfileForm,
  type UserProfileFormType,
} from "~/components/users/forms/profile-form";
import { UpsertENSForm } from "~/components/users/forms/update-ens-form";
import { useAuth } from "~/hooks/useAuth";
import { useENS } from "~/lib/sarafu/resolver";
import { trpc } from "~/lib/trpc";

export function Profile() {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.me.update.useMutation();
  const auth = useAuth();
  const ens = useENS({
    address: auth?.account?.address,
  });
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
    <ContentContainer title="Profile" className="pb-4 md:pb-0 bg-transparent">
      <div className="w-full mt-4 flex flex-col flex-grow mx-auto px-1 sm:px-2 gap-6">
        <Card className="mx-auto md:min-w-[60%] min-w-full">
          <CardHeader className="items-center text-center">
            <Avatar className="flex-none h-24 w-24 mb-4">
              <Identicon address={auth?.account?.address ?? ""} size={96} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">
              {auth?.user?.given_names ?? "Unknown User"}
            </CardTitle>
            <CardDescription className="flex flex-col sm:flex-row items-center gap-2">
              <Address address={auth?.account?.address ?? ""} />
              <ResponsiveModal
                button={
                  <Button variant="outline" size="xs" disabled={isPending}>
                    {ens.data ? "Update ENS" : "Set ENS"}
                  </Button>
                }
                title={ens.data ? "Update ENS" : "Set ENS"}
                description={
                  ens.data
                    ? "Update your ENS name."
                    : "Set your ENS name to be used by others to send you vouchers."
                }
              >
                <div>
                  <UpsertENSForm onSuccess={ens.refetch} />
                </div>
              </ResponsiveModal>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mx-auto md:min-w-[60%] min-w-full">
          <Tabs defaultValue="profile" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger disabled={true} value="vouchers">
                  Vouchers
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="profile" className="mt-0">
                {auth?.user ? (
                  <ProfileForm
                    buttonLabel="Update Profile"
                    isLoading={isPending}
                    initialValues={auth.user}
                    onSubmit={updateUser}
                  />
                ) : (
                  <p>Loading profile...</p>
                )}
              </TabsContent>
              <TabsContent value="vouchers" className="mt-0">
                <p>Vouchers content will go here.</p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </ContentContainer>
  );
}
