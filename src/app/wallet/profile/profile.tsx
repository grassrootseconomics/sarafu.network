"use client";
import { toast } from "sonner";
import Address from "~/components/address";
import Identicon from "~/components/identicon";
import { ContentContainer } from "~/components/layout/content-container";
import { ResponsiveModal } from "~/components/responsive-modal";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  ProfileForm,
  RoleForm,
  type UserProfileFormType,
  type UserRoleFormType,
} from "~/components/users/forms";
import { UpsertENSForm } from "~/components/users/forms/update-ens-form";
import { useAuth } from "~/hooks/useAuth";
import { useENS } from "~/lib/sarafu/resolver";
import { trpc } from "~/lib/trpc";

export function Profile() {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.me.update.useMutation();
  const { mutateAsync: updateRole, isPending: isRoleUpdating } =
    trpc.user.updateRole.useMutation();
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

  const updateUserRole = (data: UserRoleFormType) => {
    if (!auth?.account?.address || !data.role) {
      return;
    }
    updateRole({
      address: auth.account.address,
      role: data.role,
    })
      .then(() => {
        toast.success("Role updated successfully");
        void utils.me.invalidate();
      })
      .catch((err: Error) => {
        toast.error(`Failed to update role: ${err.message}`);
      });
  };

  return (
    <ContentContainer title="Profile" className="pb-20 md:pb-0 bg-transparent">
      <div className="w-full mt-4 flex flex-col flex-grow mx-auto px-1 sm:px-2 gap-6">
        <div className="mx-auto md:min-w-[60%] min-w-full flex">
          <div className="flex flex-col items-center text-center mx-auto">
            <Avatar className="flex-none h-24 w-24 mb-4">
              <Identicon address={auth?.account?.address ?? ""} size={96} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <div className="text-lg">
              {auth?.user?.given_names ?? "Unknown User"}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
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
            </div>
          </div>
        </div>

        <div className="mx-auto md:min-w-[60%] min-w-full">
          <Tabs defaultValue="profile" className="w-full">
            <div>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger disabled={true} value="vouchers">
                  Vouchers
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="mt-4">
              <TabsContent value="profile" className="mt-0">
                {auth?.user ? (
                  <div className="space-y-8">
                    <ProfileForm
                      buttonLabel="Update Profile"
                      isLoading={isPending}
                      initialValues={auth.user}
                      onSubmit={updateUser}
                    />
                    <RoleForm
                      isLoading={isRoleUpdating}
                      initialValues={{ role: auth.user.role }}
                      onSubmit={updateUserRole}
                      buttonLabel="Update My Role"
                    />
                  </div>
                ) : (
                  <p>Loading profile...</p>
                )}
              </TabsContent>
              <TabsContent value="vouchers" className="mt-0">
                <p>Vouchers content will go here.</p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ContentContainer>
  );
}
