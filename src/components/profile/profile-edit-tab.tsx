"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { ResponsiveModal } from "~/components/modal";
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

/**
 * Profile edit tab component for authenticated users viewing their own profile
 *
 * Features:
 * - Edit profile information (name, location, etc.)
 * - Update user role
 * - Manage ENS name
 *
 * This component is only shown when a user is viewing their own profile.
 */
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
    <div className="space-y-8 py-6">
      {/* ENS Management Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">ENS Name</h3>
          <p className="text-sm text-muted-foreground">
            Set your ENS name to be used by others to send you vouchers.
          </p>
        </div>
        <ResponsiveModal
          button={
            <Button variant="outline" size="sm" disabled={isPending}>
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

      {/* Profile Information Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information and location.
          </p>
        </div>
        <ProfileForm
          buttonLabel="Update Profile"
          isLoading={isPending}
          initialValues={auth.user}
          onSubmit={updateUser}
        />
      </div>

      {/* Role Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">User Role</h3>
          <p className="text-sm text-muted-foreground">
            Select your primary role in the Sarafu Network.
          </p>
        </div>
        <RoleForm
          isLoading={isRoleUpdating}
          initialValues={{ role: auth.user.role }}
          onSubmit={updateUserRole}
          buttonLabel="Update My Role"
        />
      </div>
    </div>
  );
}
