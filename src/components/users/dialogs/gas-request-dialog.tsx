import { useState } from "react";
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
import { useToast } from "../../ui/use-toast";
import { ProfileForm, type UserProfileFormType } from "../forms/profile-form";

const GasRequestDialog = () => {
  const { toast } = useToast();
  const me = api.me.get.useQuery();
  const updateMe = api.me.update.useMutation();
  const utils = api.useUtils();
  const requestGas = api.me.requestGas.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const applyAndUpdateProfile = (data: UserProfileFormType) => {
    updateMe
      .mutateAsync(data)
      .then(() => {
        void utils.me.invalidate();

        requestGas
          .mutateAsync()
          .then(() => {
            toast({
              title: "Success",
              description: "Your request has been sent",
              variant: "default",
            });
          })
          .catch((err: Error) => {
            toast({
              title: "Error",
              description: err.message,
              variant: "destructive",
            });
          });
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
      <DialogTrigger asChild>
        <Button variant={"ghost"}>Apply</Button>
      </DialogTrigger>
      <DialogContent className="p-4 lg:max-w-screen-lg overflow-y-scroll max-h-screen">
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
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GasRequestDialog;
