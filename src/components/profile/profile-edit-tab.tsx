"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ResponsiveModal } from "~/components/modal";
import {
  ProfileForm,
  RoleForm,
  type UserProfileFormType,
  type UserRoleFormType,
} from "~/components/users/forms";
import { UpsertENSForm } from "~/components/users/forms/update-ens-form";
import { useAuth } from "~/hooks/use-auth";
import { useENS } from "~/lib/sarafu/resolver";
import { trpc } from "~/lib/trpc";

export function ProfileEditTab() {
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

  if (!auth?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information, photo, and location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            buttonLabel="Save Changes"
            isLoading={isPending}
            initialValues={auth.user}
            onSubmit={updateUser}
          />
        </CardContent>
      </Card>

      {/* Role & ENS */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your role and blockchain identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RoleForm
            isLoading={isRoleUpdating}
            initialValues={{ role: auth.user.role }}
            onSubmit={updateUserRole}
            buttonLabel="Update Role"
          />

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">ENS Name</p>
              <p className="text-sm text-muted-foreground">
                {ens.data
                  ? `Currently set to ${ens.data.name}`
                  : "Set a human-readable name for your address."}
              </p>
            </div>
            <ResponsiveModal
              button={
                <Button variant="outline" size="sm">
                  <Link2 className="size-4" />
                  {ens.data ? "Update" : "Set ENS"}
                </Button>
              }
              title={ens.data ? "Update ENS" : "Set ENS"}
              description="Set your ENS name so others can send you vouchers easily."
            >
              <UpsertENSForm onSuccess={ens.refetch} />
            </ResponsiveModal>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
