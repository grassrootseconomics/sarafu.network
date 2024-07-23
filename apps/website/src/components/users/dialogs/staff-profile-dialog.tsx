// External imports

// Internal imports

// Components
import type { UpdateUserProfileInput } from "@grassroots/validators/user";
import { toast } from "sonner";
import { Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";
import { ProfileForm } from "../forms/profile-form";
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
  const utils = api.useUtils();

  const { data: userProfile, isLoading } = api.user.get.useQuery(
    {
      address: address!,
    },
    {
      enabled: Boolean(address),
    }
  );

  const { mutateAsync, isPending: isMutating } = api.user.update.useMutation();
  const onSubmit = (data: UpdateUserProfileInput) => {
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
        setIsOpen(false);
      })
      .catch((err: Error) => {
        toast.error(err.message);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {button && <DialogTrigger asChild>{button}</DialogTrigger>}
      <DialogContent className="p-4 lg:max-w-screen-lg overflow-y-scroll max-h-dvh">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="text-2xl font-semibold">Gas</div>
            {address && <StaffGasApproval address={address} />}
            <div className="text-2xl font-semibold">Profile</div>
            {userProfile && (
              <ProfileForm
                isLoading={isMutating || isLoading}
                onSubmit={onSubmit}
                initialValues={userProfile}
                buttonLabel="Update"
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
