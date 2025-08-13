"use client";

import { toast } from "sonner";
import { Loading } from "~/components/loading";
import { trpc } from "~/lib/trpc";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";
import { ProfileForm, RoleForm, type UserProfileFormType, type UserRoleFormType } from "../forms";
import StaffGasApproval from "../staff-gas-status";
export const StaffProfileDialog = ({
  isOpen,
  setIsOpen,
  address,
  button,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  address?: `0x${string}`;
  button?: React.ReactNode;
}) => {
  const utils = trpc.useUtils();

  const { data: userProfile, isLoading } = trpc.user.get.useQuery(
    {
      address: address!,
    },
    {
      enabled: Boolean(address),
    }
  );

  const { mutateAsync, isPending: isMutating } = trpc.user.update.useMutation();
  const { mutateAsync: updateRole, isPending: isRoleUpdating } = trpc.user.updateRole.useMutation();

  const onSubmit = (data: UserProfileFormType) => {
    if (!address) {
      return;
    }
    mutateAsync({
      address,
      data,
    })
      .then(() => {
        toast.success("Profile Updated");
        void utils.user.invalidate();
      })
      .catch((err: Error) => {
        toast.error(err.message);
      });
  };

  const onRoleSubmit = (data: UserRoleFormType) => {
    if (!address || !data.role) {
      return;
    }
    updateRole({
      address,
      role: data.role,
    })
      .then(() => {
        toast.success("User role updated successfully");
        void utils.user.invalidate();
      })
      .catch((err: Error) => {
        toast.error(`Failed to update role: ${err.message}`);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {button && <DialogTrigger asChild>{button}</DialogTrigger>}
      <DialogContent className="p-4 lg:max-w-screen-lg overflow-y-scroll max-h-dvh">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-8">
            <div>
              <div className="text-2xl font-semibold mb-4">Gas</div>
              {address && <StaffGasApproval address={address} />}
            </div>

            <div>
              <div className="text-2xl font-semibold mb-4">User Role</div>
              {userProfile && (
                <RoleForm
                  isLoading={isRoleUpdating}
                  onSubmit={onRoleSubmit}
                  initialValues={{ role: userProfile.role }}
                  buttonLabel="Update Role"
                />
              )}
            </div>

            <div>
              <div className="text-2xl font-semibold mb-4">Profile</div>
              {userProfile && (
                <ProfileForm
                  isLoading={isMutating || isLoading}
                  onSubmit={onSubmit}
                  initialValues={{
                    year_of_birth: userProfile.year_of_birth,
                    family_name: userProfile.family_name,
                    given_names: userProfile.given_names,
                    location_name: userProfile.location_name,
                    default_voucher: userProfile.default_voucher,
                    geo: userProfile.geo,
                  }}
                  buttonLabel="Update Profile"
                />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
