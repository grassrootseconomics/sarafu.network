// External imports

// Internal imports

// Components
import { Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";
import { useToast } from "../../ui/use-toast";
import { ProfileForm, type UserProfileFormType } from "../forms/profile-form";
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
  const { toast } = useToast();
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
  const onSubmit = (data: UserProfileFormType) => {
    if (!address) {
      return;
    }
    mutateAsync({
      address,
      data,
    })
      .then(() => {
        toast({
          title: "Success",
          description: "Profile Updated",
          variant: "default",
        });
        void utils.user.invalidate();
        setIsOpen(false);
      })
      .catch((err: Error) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {button && <DialogTrigger asChild>{button}</DialogTrigger>}
      <DialogContent className="p-4 lg:max-w-screen-lg overflow-y-scroll max-h-screen">
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
