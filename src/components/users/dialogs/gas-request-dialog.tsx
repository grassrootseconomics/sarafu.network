import { useState } from "react";
import { toast } from "sonner";
import { Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { ProfileForm, type UserProfileFormType } from "../forms/profile-form";

const GasRequestDialog = () => {
  const me = api.me.get.useQuery();
  const updateMe = api.me.update.useMutation();
  const utils = api.useUtils();
  const requestGas = api.me.requestGas.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const applyAndUpdateProfile = async (data: UserProfileFormType) => {
    try {
      await updateMe.mutateAsync(data);
      await requestGas.mutateAsync();
      toast.success("Your request has been sent");
      setIsOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      await utils.me.invalidate();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="p-4 lg:max-w-dvh-lg overflow-y-scroll max-h-dvh">
        <DialogHeader>
          <DialogTitle>Sign-Up for a Social Account</DialogTitle>
          <DialogDescription>
            Please update your profile to receive Celo access
          </DialogDescription>
        </DialogHeader>
        {me.isLoading ? (
          <Loading />
        ) : (
          me.data && (
            <ProfileForm
              buttonLabel="Apply and Update Profile"
              initialValues={me.data}
              onSubmit={applyAndUpdateProfile}
              isLoading={updateMe.isPending || requestGas.isPending}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GasRequestDialog;
